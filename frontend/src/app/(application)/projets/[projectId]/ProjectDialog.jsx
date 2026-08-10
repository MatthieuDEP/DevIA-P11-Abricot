"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { Trash2, UserMinus, X } from "lucide-react";
import {
  addContributorAction,
  deleteProjectAction,
  removeContributorAction,
  updateProjectAction,
} from "../actions";
import styles from "./ProjectDialog.module.css";

const initialState = { status: "idle", message: "", fieldErrors: {} };

export default function ProjectDialog({ project, open, onClose, onNotice }) {
  const [projectState, projectAction, projectPending] = useActionState(
    updateProjectAction.bind(null, project.id),
    initialState
  );
  const [memberState, memberAction, memberPending] = useActionState(
    addContributorAction.bind(null, project.id),
    initialState
  );
  const [isMutating, startTransition] = useTransition();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open && !dialogRef.current?.open) dialogRef.current?.showModal();
    if (!open && dialogRef.current?.open) dialogRef.current?.close();
  }, [open]);

  useEffect(() => {
    if (projectState.status === "success") {
      onNotice(projectState.message);
      onClose();
    }
  }, [projectState, onClose, onNotice]);

  useEffect(() => {
    if (memberState.status === "success") onNotice(memberState.message);
  }, [memberState, onNotice]);

  function removeMember(userId, label) {
    if (!window.confirm(`Retirer ${label} du projet ?`)) return;
    startTransition(async () => {
      const result = await removeContributorAction(project.id, userId);
      onNotice(result.message, result.status);
    });
  }

  function deleteProject() {
    if (!window.confirm("Supprimer définitivement ce projet et toutes ses tâches ?")) return;
    startTransition(async () => {
      const result = await deleteProjectAction(project.id);
      if (result?.status === "error") onNotice(result.message, "error");
    });
  }

  return (
    <dialog className={styles.dialog} onCancel={onClose} ref={dialogRef}>
      <div className={styles.dialogHeader}>
        <div>
          <p className={styles.eyebrow}>Paramètres</p>
          <h2>Modifier le projet</h2>
        </div>
        <button aria-label="Fermer la fenêtre" className={styles.iconButton} onClick={onClose} type="button">
          <X aria-hidden="true" size={20} />
        </button>
      </div>

      <div className={styles.dialogBody}>
        <form action={projectAction} className={styles.compactForm}>
          {projectState.status === "error" && <p className={styles.errorBanner} role="alert">{projectState.message}</p>}
          <label className={styles.formField}>
            <span>Nom</span>
            <input defaultValue={project.name} maxLength="100" name="name" required />
            {projectState.fieldErrors?.name && <small className={styles.fieldError}>{projectState.fieldErrors.name}</small>}
          </label>
          <label className={styles.formField}>
            <span>Description</span>
            <textarea defaultValue={project.description || ""} maxLength="500" name="description" rows="3" />
          </label>
          <button className={styles.primaryButton} disabled={projectPending} type="submit">
            {projectPending ? "Enregistrement…" : "Enregistrer les informations"}
          </button>
        </form>

        <section className={styles.memberSection}>
          <h3>Contributeurs</h3>
          <ul className={styles.memberList}>
            {(project.members || []).map((member) => (
              <li key={member.id}>
                <span>{member.user.name || member.user.email}</span>
                <button
                  aria-label={`Retirer ${member.user.name || member.user.email}`}
                  disabled={isMutating}
                  onClick={() => removeMember(member.user.id, member.user.name || member.user.email)}
                  type="button"
                >
                  <UserMinus aria-hidden="true" size={17} />
                </button>
              </li>
            ))}
          </ul>
          <form action={memberAction} className={styles.inlineForm}>
            <label className={styles.formField}>
              <span>Ajouter par e-mail</span>
              <input name="email" placeholder="collaborateur@example.com" required type="email" />
              {memberState.status === "error" && (
                <small className={styles.fieldError}>{memberState.fieldErrors?.email || memberState.message}</small>
              )}
            </label>
            <button className={styles.secondaryButton} disabled={memberPending} type="submit">
              {memberPending ? "Ajout…" : "Ajouter"}
            </button>
          </form>
        </section>

        <section className={styles.dangerZone}>
          <div>
            <h3>Supprimer le projet</h3>
            <p>Cette action supprime également les tâches et commentaires associés.</p>
          </div>
          <button className={styles.dangerButton} disabled={isMutating} onClick={deleteProject} type="button">
            <Trash2 aria-hidden="true" size={17} /> Supprimer
          </button>
        </section>
      </div>
    </dialog>
  );
}
