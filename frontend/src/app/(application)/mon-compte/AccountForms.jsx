"use client";

import { useActionState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { updatePasswordAction, updateProfileAction } from "./actions";
import styles from "./page.module.css";

const initialState = { status: "idle", message: "", fieldErrors: {} };

export default function AccountForms({ user, firstName, lastName }) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, initialState);
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePasswordAction, initialState);
  const passwordFormRef = useRef(null);
  const passwordDialogRef = useRef(null);

  useEffect(() => {
    if (passwordState.status === "success") {
      passwordFormRef.current?.reset();
      passwordDialogRef.current?.close();
    }
  }, [passwordState]);

  return (
    <div className={styles.formsStack}>
      <form action={profileAction} className={styles.accountForm}>
        {profileState.status !== "idle" && (
          <p className={profileState.status === "success" ? styles.successBanner : styles.errorBanner} role={profileState.status === "success" ? "status" : "alert"}>
            {profileState.message}
          </p>
        )}
        <label className={styles.formField}>
          <span>Nom</span>
          <input autoComplete="family-name" defaultValue={lastName} name="lastName" required type="text" />
          {profileState.fieldErrors?.lastName && <small>{profileState.fieldErrors.lastName}</small>}
        </label>
        <label className={styles.formField}>
          <span>Prénom</span>
          <input autoComplete="given-name" defaultValue={firstName} name="firstName" required type="text" />
          {profileState.fieldErrors?.firstName && <small>{profileState.fieldErrors.firstName}</small>}
        </label>
        <label className={styles.formField}>
          <span>Email</span>
          <input autoComplete="email" defaultValue={user.email} name="email" required type="email" />
          {profileState.fieldErrors?.email && <small>{profileState.fieldErrors.email}</small>}
        </label>
        <div className={styles.formField}>
          <span>Mot de passe</span>
          <button
            aria-haspopup="dialog"
            className={styles.passwordTrigger}
            onClick={() => passwordDialogRef.current?.showModal()}
            type="button"
          >
            <span aria-hidden="true">••••••••••••</span>
            <span className={styles.visuallyHidden}>Modifier le mot de passe</span>
          </button>
        </div>
        <button className={styles.primaryButton} disabled={profilePending} type="submit">
          {profilePending ? "Modification…" : "Modifier les informations"}
        </button>
      </form>

      <dialog
        aria-labelledby="password-dialog-title"
        className={styles.dialog}
        onClick={(event) => {
          if (event.target === passwordDialogRef.current) passwordDialogRef.current.close();
        }}
        ref={passwordDialogRef}
      >
        <div className={styles.dialogHeader}>
          <div>
            <h2 id="password-dialog-title">Modifier le mot de passe</h2>
            <p>Confirmez votre mot de passe actuel avant d’en choisir un nouveau.</p>
          </div>
          <button
            aria-label="Fermer la fenêtre"
            className={styles.iconButton}
            onClick={() => passwordDialogRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <form action={passwordAction} className={styles.passwordForm} ref={passwordFormRef}>
          {passwordState.status !== "idle" && (
            <p className={passwordState.status === "success" ? styles.successBanner : styles.errorBanner} role={passwordState.status === "success" ? "status" : "alert"}>
              {passwordState.message}
            </p>
          )}
          <label className={styles.formField}>
            <span>Mot de passe actuel</span>
            <input autoComplete="current-password" name="currentPassword" required type="password" />
            {passwordState.fieldErrors?.currentPassword && <small>{passwordState.fieldErrors.currentPassword}</small>}
          </label>
          <label className={styles.formField}>
            <span>Nouveau mot de passe</span>
            <input autoComplete="new-password" name="newPassword" required type="password" />
            {passwordState.fieldErrors?.newPassword && <small>{passwordState.fieldErrors.newPassword}</small>}
          </label>
          <label className={styles.formField}>
            <span>Confirmer le mot de passe</span>
            <input autoComplete="new-password" name="confirmation" required type="password" />
            {passwordState.fieldErrors?.confirmation && <small>{passwordState.fieldErrors.confirmation}</small>}
          </label>
          <p className={styles.passwordHelp}>8 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.</p>
          <div className={styles.dialogActions}>
            <button
              className={styles.secondaryButton}
              onClick={() => passwordDialogRef.current?.close()}
              type="button"
            >
              Annuler
            </button>
            <button className={styles.primaryButton} disabled={passwordPending} type="submit">
              {passwordPending ? "Modification…" : "Modifier le mot de passe"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
