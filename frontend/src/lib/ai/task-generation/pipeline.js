import "server-only";

import { buildContextDocuments, projectUsers } from "./context";
import { requestStructuredTasks } from "./generation";
import { retrieveProjectContext } from "./retrieval";
import { generatedTaskListSchema } from "./schema";

export class TaskGenerationError extends Error {
  constructor(code, message, cause) {
    super(message, { cause });
    this.name = "TaskGenerationError";
    this.code = code;
  }
}

function normalizeDueDate(value) {
  if (!value) return null;

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T12:00:00.000Z`
    : value;
  const date = new Date(dateOnly);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeTasks(generated, project, existingTasks) {
  const allowedUserIds = new Set(projectUsers(project).map((user) => user.id));
  const existingTitles = new Set(
    existingTasks.map((task) => task.title.trim().toLocaleLowerCase("fr"))
  );
  const selectedTitles = new Set();

  const tasks = generated.tasks.flatMap((task) => {
    const title = task.title.trim();
    const normalizedTitle = title.toLocaleLowerCase("fr");

    if (existingTitles.has(normalizedTitle) || selectedTitles.has(normalizedTitle)) {
      return [];
    }

    selectedTitles.add(normalizedTitle);

    return [{
      title,
      description: task.description.trim(),
      status: task.status,
      priority: task.priority,
      dueDate: normalizeDueDate(task.dueDate),
      assigneeIds: [...new Set(task.assigneeIds)].filter((id) => allowedUserIds.has(id)),
    }];
  });

  if (tasks.length === 0) {
    throw new TaskGenerationError(
      "NO_NEW_TASKS",
      "Mistral n’a proposé que des tâches déjà présentes dans ce projet."
    );
  }

  return generatedTaskListSchema.parse({ tasks });
}

function providerError(error) {
  const status = error?.statusCode || error?.status || error?.response?.status;

  if (status === 401 || status === 403) {
    return new TaskGenerationError(
      "INVALID_API_KEY",
      "La configuration Mistral est invalide. Vérifiez la clé API.",
      error
    );
  }
  if (status === 429) {
    return new TaskGenerationError(
      "RATE_LIMIT",
      "Le quota Mistral est momentanément atteint. Réessayez dans quelques instants.",
      error
    );
  }
  if (error?.name === "RequestTimeoutError" || error?.name === "AbortError") {
    return new TaskGenerationError(
      "TIMEOUT",
      "La génération prend trop de temps. Réessayez avec une demande plus courte.",
      error
    );
  }

  return new TaskGenerationError(
    "PROVIDER_UNAVAILABLE",
    "Le service de génération est momentanément indisponible. Réessayez plus tard.",
    error
  );
}

export async function generateProjectTasks({ project, tasks, prompt }) {
  const apiKey = process.env.MISTRAL_API_KEY;
  const model = process.env.MISTRAL_MODEL || "mistral-small-latest";

  if (!apiKey) {
    throw new TaskGenerationError(
      "MISSING_API_KEY",
      "La clé API Mistral n’est pas configurée sur le serveur."
    );
  }

  const currentDate = new Date().toISOString().slice(0, 10);

  try {
    const documents = buildContextDocuments(project, tasks, currentDate);
    const context = await retrieveProjectContext(documents, prompt, apiKey);
    const generated = await requestStructuredTasks({
      apiKey,
      model,
      prompt,
      context,
      currentDate,
    });

    return normalizeTasks(generated, project, tasks);
  } catch (error) {
    if (error instanceof TaskGenerationError) throw error;
    throw providerError(error);
  }
}
