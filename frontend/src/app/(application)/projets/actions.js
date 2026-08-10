"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { authenticatedApiRequest, getProjectWorkspace } from "@/lib/application-api";
import { generateProjectTasks, TaskGenerationError } from "@/lib/ai/task-generation/pipeline";
import { generatedTaskListSchema, promptSchema } from "@/lib/ai/task-generation/schema";

function text(formData, field) {
  return String(formData.get(field) || "").trim();
}

function selectedValues(formData, field) {
  return formData.getAll(field).map(String).filter(Boolean);
}

function validationState(fieldErrors) {
  return {
    status: "error",
    message: "Vérifiez les informations saisies.",
    fieldErrors,
  };
}

function errorState(error) {
  if (error?.digest?.startsWith?.("NEXT_REDIRECT")) {
    throw error;
  }

  if (error instanceof ApiError) {
    const errors = error.payload?.data?.errors || [];
    const fieldErrors = Object.fromEntries(
      errors.map((item) => [item.field, item.message])
    );

    return {
      status: "error",
      message: error.message,
      fieldErrors,
    };
  }

  return {
    status: "error",
    message: "Une erreur inattendue est survenue. Réessayez.",
    fieldErrors: {},
  };
}

function refreshProject(projectId) {
  revalidatePath("/projets");
  revalidatePath(`/projets/${projectId}`);
  revalidatePath("/tableau-de-bord");
}

function projectPath(projectId, suffix = "") {
  return `/projects/${encodeURIComponent(projectId)}${suffix}`;
}

export async function createProjectAction(_previousState, formData) {
  const name = text(formData, "name");
  const description = text(formData, "description");
  const contributors = text(formData, "contributors")
    .split(/[\n,;]/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const fieldErrors = {};
  if (name.length < 2) fieldErrors.name = "Le nom doit contenir au moins 2 caractères.";
  if (name.length > 100) fieldErrors.name = "Le nom ne peut pas dépasser 100 caractères.";
  if (description.length > 500) {
    fieldErrors.description = "La description ne peut pas dépasser 500 caractères.";
  }

  if (Object.keys(fieldErrors).length > 0) return validationState(fieldErrors);

  try {
    const response = await authenticatedApiRequest("/projects", {
      method: "POST",
      body: JSON.stringify({ name, description, contributors }),
    });
    revalidatePath("/projets");
    revalidatePath("/tableau-de-bord");

    return {
      status: "success",
      message: response.message || "Projet créé avec succès.",
      fieldErrors: {},
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function updateProjectAction(projectId, _previousState, formData) {
  const name = text(formData, "name");
  const description = text(formData, "description");
  const fieldErrors = {};

  if (name.length < 2) fieldErrors.name = "Le nom doit contenir au moins 2 caractères.";
  if (name.length > 100) fieldErrors.name = "Le nom ne peut pas dépasser 100 caractères.";
  if (description.length > 500) {
    fieldErrors.description = "La description ne peut pas dépasser 500 caractères.";
  }

  if (Object.keys(fieldErrors).length > 0) return validationState(fieldErrors);

  try {
    const response = await authenticatedApiRequest(projectPath(projectId), {
      method: "PUT",
      body: JSON.stringify({ name, description }),
    });
    refreshProject(projectId);

    return {
      status: "success",
      message: response.message || "Projet mis à jour.",
      fieldErrors: {},
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function deleteProjectAction(projectId) {
  try {
    await authenticatedApiRequest(projectPath(projectId), { method: "DELETE" });
  } catch (error) {
    return errorState(error);
  }

  revalidatePath("/projets");
  revalidatePath("/tableau-de-bord");
  redirect("/projets?notice=project-deleted");
}

export async function addContributorAction(projectId, _previousState, formData) {
  const email = text(formData, "email").toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return validationState({ email: "Saisissez une adresse e-mail valide." });
  }

  try {
    const response = await authenticatedApiRequest(
      projectPath(projectId, "/contributors"),
      {
        method: "POST",
        body: JSON.stringify({ email, role: "CONTRIBUTOR" }),
      }
    );
    refreshProject(projectId);

    return {
      status: "success",
      message: response.message || "Contributeur ajouté.",
      fieldErrors: {},
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function removeContributorAction(projectId, userId) {
  try {
    await authenticatedApiRequest(
      projectPath(projectId, `/contributors/${encodeURIComponent(userId)}`),
      { method: "DELETE" }
    );
    refreshProject(projectId);
    return { status: "success", message: "Contributeur retiré.", fieldErrors: {} };
  } catch (error) {
    return errorState(error);
  }
}

export async function createTaskAction(projectId, _previousState, formData) {
  const title = text(formData, "title");
  const description = text(formData, "description");
  const status = text(formData, "status") || "TODO";
  const priority = text(formData, "priority") || "MEDIUM";
  const dueDate = text(formData, "dueDate");
  const assigneeIds = selectedValues(formData, "assigneeIds");
  const fieldErrors = {};

  if (title.length < 2) fieldErrors.title = "Le titre doit contenir au moins 2 caractères.";
  if (title.length > 200) fieldErrors.title = "Le titre ne peut pas dépasser 200 caractères.";
  if (description.length > 1000) {
    fieldErrors.description = "La description ne peut pas dépasser 1 000 caractères.";
  }

  if (Object.keys(fieldErrors).length > 0) return validationState(fieldErrors);

  try {
    const response = await authenticatedApiRequest(
      projectPath(projectId, "/tasks"),
      {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          status,
          priority,
          dueDate: dueDate || undefined,
          assigneeIds,
        }),
      }
    );
    refreshProject(projectId);

    return {
      status: "success",
      message: response.message || "Tâche créée.",
      fieldErrors: {},
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function generateTasksAction(projectId, prompt) {
  const parsedPrompt = promptSchema.safeParse(prompt);

  if (!parsedPrompt.success) {
    return {
      status: "error",
      message: parsedPrompt.error.issues[0]?.message || "Demande invalide.",
      tasks: [],
    };
  }

  try {
    const workspace = await getProjectWorkspace(projectId);

    if (!workspace.project) {
      return {
        status: "error",
        message: "Projet introuvable.",
        tasks: [],
      };
    }

    const result = await generateProjectTasks({
      project: workspace.project,
      tasks: workspace.tasks,
      prompt: parsedPrompt.data,
    });

    return {
      status: "success",
      message: `${result.tasks.length} proposition${result.tasks.length > 1 ? "s" : ""} générée${result.tasks.length > 1 ? "s" : ""}.`,
      tasks: result.tasks,
    };
  } catch (error) {
    if (error instanceof TaskGenerationError) {
      return { status: "error", message: error.message, tasks: [] };
    }

    const state = errorState(error);
    return { ...state, tasks: [] };
  }
}

export async function createGeneratedTasksAction(projectId, tasks) {
  const parsedTasks = generatedTaskListSchema.safeParse({ tasks });

  if (!parsedTasks.success) {
    return {
      status: "error",
      message: "Certaines propositions sont invalides. Vérifiez les champs modifiés.",
      fieldErrors: {},
    };
  }

  try {
    const response = await authenticatedApiRequest(
      projectPath(projectId, "/tasks/bulk"),
      {
        method: "POST",
        body: JSON.stringify({ tasks: parsedTasks.data.tasks }),
      }
    );
    refreshProject(projectId);

    return {
      status: "success",
      message: response.message || "Les tâches ont été ajoutées.",
      fieldErrors: {},
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function updateTaskAction(projectId, taskId, _previousState, formData) {
  const title = text(formData, "title");
  const description = text(formData, "description");
  const status = text(formData, "status");
  const priority = text(formData, "priority");
  const dueDate = text(formData, "dueDate");
  const assigneeIds = selectedValues(formData, "assigneeIds");
  const fieldErrors = {};

  if (title.length < 2) fieldErrors.title = "Le titre doit contenir au moins 2 caractères.";
  if (title.length > 200) fieldErrors.title = "Le titre ne peut pas dépasser 200 caractères.";
  if (description.length > 1000) {
    fieldErrors.description = "La description ne peut pas dépasser 1 000 caractères.";
  }

  if (Object.keys(fieldErrors).length > 0) return validationState(fieldErrors);

  try {
    const response = await authenticatedApiRequest(
      projectPath(projectId, `/tasks/${encodeURIComponent(taskId)}`),
      {
        method: "PUT",
        body: JSON.stringify({
          title,
          description,
          status,
          priority,
          dueDate: dueDate || "",
          assigneeIds,
        }),
      }
    );
    refreshProject(projectId);

    return {
      status: "success",
      message: response.message || "Tâche mise à jour.",
      fieldErrors: {},
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function deleteTaskAction(projectId, taskId) {
  try {
    await authenticatedApiRequest(
      projectPath(projectId, `/tasks/${encodeURIComponent(taskId)}`),
      { method: "DELETE" }
    );
    refreshProject(projectId);
    return { status: "success", message: "Tâche supprimée.", fieldErrors: {} };
  } catch (error) {
    return errorState(error);
  }
}

export async function createCommentAction(projectId, taskId, _previousState, formData) {
  const content = text(formData, "content");

  if (!content) return validationState({ content: "Le commentaire ne peut pas être vide." });
  if (content.length > 2000) {
    return validationState({ content: "Le commentaire ne peut pas dépasser 2 000 caractères." });
  }

  try {
    const response = await authenticatedApiRequest(
      projectPath(projectId, `/tasks/${encodeURIComponent(taskId)}/comments`),
      { method: "POST", body: JSON.stringify({ content }) }
    );
    refreshProject(projectId);
    return { status: "success", message: response.message, fieldErrors: {} };
  } catch (error) {
    return errorState(error);
  }
}

export async function updateCommentAction(
  projectId,
  taskId,
  commentId,
  _previousState,
  formData
) {
  const content = text(formData, "content");

  if (!content) return validationState({ content: "Le commentaire ne peut pas être vide." });

  try {
    const response = await authenticatedApiRequest(
      projectPath(
        projectId,
        `/tasks/${encodeURIComponent(taskId)}/comments/${encodeURIComponent(commentId)}`
      ),
      { method: "PUT", body: JSON.stringify({ content }) }
    );
    refreshProject(projectId);
    return { status: "success", message: response.message, fieldErrors: {} };
  } catch (error) {
    return errorState(error);
  }
}

export async function deleteCommentAction(projectId, taskId, commentId) {
  try {
    await authenticatedApiRequest(
      projectPath(
        projectId,
        `/tasks/${encodeURIComponent(taskId)}/comments/${encodeURIComponent(commentId)}`
      ),
      { method: "DELETE" }
    );
    refreshProject(projectId);
    return { status: "success", message: "Commentaire supprimé.", fieldErrors: {} };
  } catch (error) {
    return errorState(error);
  }
}
