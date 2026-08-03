"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/(auth)/actions";
import styles from "./AuthShell.module.css";

const initialState = {
  message: "",
  fieldErrors: {},
  values: {},
};

export default function LoginForm({ redirectTo = "", notice = "" }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className={styles.form} noValidate>
      <input name="redirectTo" type="hidden" value={redirectTo} />

      {notice ? (
        <p className={styles.formNotice} role="status">
          {notice}
        </p>
      ) : null}

      {state.message ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={styles.field}>
        <label htmlFor="login-email">Adresse e-mail</label>
        <input
          aria-describedby={state.fieldErrors.email ? "login-email-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors.email)}
          autoComplete="email"
          defaultValue={state.values.email}
          id="login-email"
          name="email"
          required
          type="email"
        />
        {state.fieldErrors.email ? (
          <small className={styles.fieldError} id="login-email-error">
            {state.fieldErrors.email}
          </small>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="login-password">Mot de passe</label>
        <input
          aria-describedby={state.fieldErrors.password ? "login-password-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors.password)}
          autoComplete="current-password"
          id="login-password"
          name="password"
          required
          type="password"
        />
        {state.fieldErrors.password ? (
          <small className={styles.fieldError} id="login-password-error">
            {state.fieldErrors.password}
          </small>
        ) : null}
      </div>

      <button className={styles.submitButton} disabled={isPending} type="submit">
        {isPending ? "Connexion…" : "Se connecter"}
      </button>

      <Link className={styles.secondaryLink} href="/mot-de-passe-oublie">
        Mot de passe oublié ?
      </Link>
    </form>
  );
}
