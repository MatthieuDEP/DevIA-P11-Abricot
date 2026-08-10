"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api";
import { authenticatedApiRequest } from "@/lib/application-api";

function errorState(error) {
  if (error?.digest?.startsWith?.("NEXT_REDIRECT")) {
    throw error;
  }

  if (error instanceof ApiError) {
    const errors = error.payload?.data?.errors || [];
    return {
      status: "error",
      message: error.message,
      fieldErrors: Object.fromEntries(errors.map((item) => [item.field, item.message])),
    };
  }

  return { status: "error", message: "Une erreur inattendue est survenue.", fieldErrors: {} };
}

export async function updateProfileAction(_previousState, formData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = [firstName, lastName].filter(Boolean).join(" ");
  const fieldErrors = {};

  if (!firstName) fieldErrors.firstName = "Le prénom est requis.";
  if (!lastName) fieldErrors.lastName = "Le nom est requis.";
  if (!/^\S+@\S+\.\S+$/.test(email)) fieldErrors.email = "Saisissez une adresse e-mail valide.";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Vérifiez les informations saisies.", fieldErrors };
  }

  try {
    const response = await authenticatedApiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name, email }),
    });
    revalidatePath("/mon-compte");
    revalidatePath("/tableau-de-bord");
    revalidatePath("/", "layout");
    return { status: "success", message: response.message, fieldErrors: {} };
  } catch (error) {
    return errorState(error);
  }
}

export async function updatePasswordAction(_previousState, formData) {
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmation = String(formData.get("confirmation") || "");
  const fieldErrors = {};
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!currentPassword) fieldErrors.currentPassword = "Le mot de passe actuel est requis.";
  if (!passwordPattern.test(newPassword)) {
    fieldErrors.newPassword = "Utilisez 8 caractères minimum avec majuscule, minuscule, chiffre et caractère spécial.";
  }
  if (newPassword !== confirmation) fieldErrors.confirmation = "Les deux mots de passe ne correspondent pas.";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Vérifiez les informations saisies.", fieldErrors };
  }

  try {
    const response = await authenticatedApiRequest("/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return { status: "success", message: response.message, fieldErrors: {} };
  } catch (error) {
    return errorState(error);
  }
}
