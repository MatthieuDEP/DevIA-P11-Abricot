"use client";

import { useActionState } from "react";
import { signupAction } from "@/app/(auth)/actions";
import styles from "./AuthShell.module.css";

const initialState = {
  message: "",
  fieldErrors: {},
  values: {},
};

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.message ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={styles.field}>
        <label htmlFor="signup-email">Adresse e-mail</label>
        <input
          aria-describedby={state.fieldErrors.email ? "signup-email-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors.email)}
          autoComplete="email"
          defaultValue={state.values.email}
          id="signup-email"
          name="email"
          required
          type="email"
        />
        {state.fieldErrors.email ? (
          <small className={styles.fieldError} id="signup-email-error">
            {state.fieldErrors.email}
          </small>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="signup-password">Mot de passe</label>
        <input
          aria-describedby={
            state.fieldErrors.password ? "signup-password-error" : "password-help"
          }
          aria-invalid={Boolean(state.fieldErrors.password)}
          autoComplete="new-password"
          id="signup-password"
          minLength={8}
          name="password"
          required
          type="password"
        />
        {state.fieldErrors.password ? (
          <small className={styles.fieldError} id="signup-password-error">
            {state.fieldErrors.password}
          </small>
        ) : (
          <small id="password-help">
            8 caractères minimum avec majuscule, minuscule, chiffre et caractère spécial.
          </small>
        )}
      </div>

      <button className={styles.submitButton} disabled={isPending} type="submit">
        {isPending ? "Création du compte…" : "S’inscrire"}
      </button>
    </form>
  );
}
