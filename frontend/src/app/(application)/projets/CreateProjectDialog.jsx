"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { createProjectAction } from "./actions";
import styles from "./CreateProjectDialog.module.css";

const initialState = { status: "idle", message: "", fieldErrors: {} };

export default function CreateProjectDialog({ contributorOptions, onCreated, open }) {
  const [selectedContributors, setSelectedContributors] = useState([]);
  const [formValid, setFormValid] = useState(false);
  const [state, formAction, isPending] = useActionState(createProjectAction, initialState);
  const dialogRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
  }, [open]);

  useEffect(() => {
    if (state.status === "success") {
      dialogRef.current?.close();
      onCreated(state.message);
    }
  }, [onCreated, state]);

  return (
    <>
      <button className={styles.primaryButton} onClick={() => dialogRef.current?.showModal()} type="button">
        <Plus aria-hidden="true" size={16} /> Créer un projet
      </button>

      <dialog aria-labelledby="create-project-title" className={styles.dialog} onClose={() => { formRef.current?.reset(); setSelectedContributors([]); setFormValid(false); }} onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current.close(); }} ref={dialogRef}>
        <div className={styles.dialogHeader}>
          <h2 id="create-project-title">Créer un projet</h2>
          <button aria-label="Fermer la fenêtre" className={styles.iconButton} onClick={() => dialogRef.current?.close()} type="button"><X aria-hidden="true" size={20} /></button>
        </div>

        <form action={formAction} className={styles.dialogForm} onInput={(event) => setFormValid(event.currentTarget.checkValidity())} ref={formRef}>
          {state.status === "error" && <p className={styles.errorBanner} role="alert">{state.message}</p>}
          <label className={styles.formField}>
            <span>Titre*</span>
            <input
              aria-describedby={state.fieldErrors?.name ? "project-name-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors?.name)}
              maxLength="100"
              name="name"
              required
            />
            {state.fieldErrors?.name && <small className={styles.fieldError} id="project-name-error">{state.fieldErrors.name}</small>}
          </label>
          <label className={styles.formField}>
            <span>Description*</span>
            <textarea
              aria-describedby={state.fieldErrors?.description ? "project-description-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors?.description)}
              maxLength="500"
              name="description"
              required
              rows="2"
            />
            {state.fieldErrors?.description && <small className={styles.fieldError} id="project-description-error">{state.fieldErrors.description}</small>}
          </label>
          <div className={styles.formField}>
            <span>Contributeurs</span>
            <details className={styles.contributorDropdown}>
              <summary>{selectedContributors.length === 0 ? "Choisir un ou plusieurs collaborateurs" : selectedContributors.length + " collaborateur" + (selectedContributors.length > 1 ? "s" : "")}</summary>
              <div className={styles.contributorOptions}>
                {contributorOptions.length > 0 ? contributorOptions.map((person) => (
                  <label key={person.id}>
                    <input checked={selectedContributors.includes(person.email)} onChange={(event) => { setSelectedContributors((current) => event.target.checked ? [...current, person.email] : current.filter((email) => email !== person.email)); }} type="checkbox" />
                    <span>{person.name || person.email}</span>
                  </label>
                )) : <p>Aucun collaborateur disponible.</p>}
              </div>
            </details>
            <input name="contributors" type="hidden" value={selectedContributors.join(",")} />
          </div>
          <div className={styles.dialogActions}>
            <button className={styles.addProjectButton} disabled={isPending || !formValid} type="submit">{isPending ? "Ajout…" : "Ajouter un projet"}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
