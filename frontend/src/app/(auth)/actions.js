"use server";

import { redirect } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";
import { createSession } from "@/lib/auth";

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function getCredentials(formData) {
  return {
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || ""),
  };
}

function getRedirectTarget(formData) {
  const target = String(formData.get("redirectTo") || "");
  return target.startsWith("/") && !target.startsWith("//") ? target : "/tableau-de-bord";
}

function getBackendFieldErrors(error) {
  const validationErrors = error.payload?.data?.errors;

  if (!Array.isArray(validationErrors)) {
    return {};
  }

  return validationErrors.reduce((errors, item) => {
    if (item?.field && item?.message) {
      errors[item.field] = item.message;
    }
    return errors;
  }, {});
}

function validateLogin(email, password) {
  const fieldErrors = {};

  if (!email) {
    fieldErrors.email = "L’adresse e-mail est requise.";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    fieldErrors.email = "Saisissez une adresse e-mail valide.";
  }

  if (!password) {
    fieldErrors.password = "Le mot de passe est requis.";
  }

  return fieldErrors;
}

export async function loginAction(_previousState, formData) {
  const { email, password } = getCredentials(formData);
  const fieldErrors = validateLogin(email, password);

  if (Object.keys(fieldErrors).length > 0) {
    return { message: "", fieldErrors, values: { email } };
  }

  try {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const token = response?.data?.token;

    if (!token) {
      return {
        message: "La réponse du serveur est incomplète. Réessayez.",
        fieldErrors: {},
        values: { email },
      };
    }

    await createSession(token);
  } catch (error) {
    if (error instanceof ApiError) {
      const message =
        error.status === 401
          ? "Adresse e-mail ou mot de passe incorrect."
          : error.message;

      return {
        message,
        fieldErrors: getBackendFieldErrors(error),
        values: { email },
      };
    }

    return {
      message: "Une erreur inattendue est survenue. Réessayez.",
      fieldErrors: {},
      values: { email },
    };
  }

  redirect(getRedirectTarget(formData));
}

export async function signupAction(_previousState, formData) {
  const { email, password } = getCredentials(formData);
  const fieldErrors = validateLogin(email, password);

  if (password && !PASSWORD_PATTERN.test(password)) {
    fieldErrors.password =
      "Utilisez 8 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { message: "", fieldErrors, values: { email } };
  }

  try {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const token = response?.data?.token;

    if (!token) {
      return {
        message: "La réponse du serveur est incomplète. Réessayez.",
        fieldErrors: {},
        values: { email },
      };
    }

    await createSession(token);
  } catch (error) {
    if (error instanceof ApiError) {
      const message =
        error.status === 409
          ? "Un compte utilise déjà cette adresse e-mail."
          : error.message;

      return {
        message,
        fieldErrors: getBackendFieldErrors(error),
        values: { email },
      };
    }

    return {
      message: "Une erreur inattendue est survenue. Réessayez.",
      fieldErrors: {},
      values: { email },
    };
  }

  redirect("/tableau-de-bord");
}
