"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Users, X } from "lucide-react";
import { createProjectAction } from "./actions";
import styles from "./page.module.css";

const initialState = { status: "idle", message: "", fieldErrors: {} };

function initials(user) {
  const source = user?.name || user?.email || "?";
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function ProjectsView({ projects, initialNotice, openCreateDialog, currentUserId }) {
  const [selectedContributors, setSelectedContributors] = useState([]);
  const [formValid, setFormValid] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createProjectAction,
    initialState
  );
  const dialogRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (openCreateDialog) dialogRef.current?.showModal();
  }, [openCreateDialog]);

  useEffect(() => {
    if (state.status === "success") {
      dialogRef.current?.close();
    }
  }, [state]);

  const contributorOptions = useMemo(() => {
    const usersByEmail = new Map();

    projects.forEach((project) => {
      const users = [
        project.owner,
        ...(project.members || []).map((member) => member.user),
      ];

      users.forEach((user) => {
        if (user?.email && user.id !== currentUserId) {
          usersByEmail.set(user.email.toLocaleLowerCase("fr"), user);
        }
      });
    });

    return [...usersByEmail.values()];
  }, [currentUserId, projects]);

  return (
    <div className={styles.pageStack}>
      <section className={styles.pageHeading}>
        <div>
          <h1>Mes projets</h1>
          <p>Gérez vos projets</p>
        </div>
        <button
          className={styles.primaryButton}
          onClick={() => dialogRef.current?.showModal()}
          type="button"
        >
          <Plus aria-hidden="true" size={16} /> Créer un projet
        </button>
      </section>

      {(initialNotice || state.status === "success") && (
        <p className={styles.successBanner} role="status">
          {state.status === "success" ? state.message : initialNotice}
        </p>
      )}

      {projects.length > 0 ? (
        <section aria-label="Liste des projets" className={styles.projectGrid}>
          {projects.map((project) => {
            const stats = project.taskStats || {
              completed: 0,
              total: project._count?.tasks || 0,
              progress: 0,
            };
            const members = project.members || [];

            return (
              <article className={styles.projectCard} key={project.id}>
                <div>
                  <h2>
                    <Link href={`/projets/${project.id}`}>{project.name}</Link>
                  </h2>
                  <p>{project.description || "Aucune description pour ce projet."}</p>
                </div>

                <div className={styles.progressBlock}>
                  <div>
                    <span>Progression</span>
                    <strong>{stats.progress}%</strong>
                  </div>
                  <div
                    aria-label={`Progression : ${stats.progress} %`}
                    aria-valuemax="100"
                    aria-valuemin="0"
                    aria-valuenow={stats.progress}
                    className={styles.progressTrack}
                    role="progressbar"
                  >
                    <span style={{ width: `${stats.progress}%` }} />
                  </div>
                  <small>
                    {stats.completed}/{stats.total} tâche{stats.total > 1 ? "s" : ""} terminée
                    {stats.completed > 1 ? "s" : ""}
                  </small>
                </div>

                <div className={styles.teamBlock}>
                  <p><Users aria-hidden="true" size={14} /> Équipe ({members.length + 1})</p>
                  <div className={styles.people}>
                    <span className={styles.avatar} title={project.owner?.name || project.owner?.email}>
                      {initials(project.owner)}
                    </span>
                    <span className={styles.ownerBadge}>Propriétaire</span>
                    <span className={styles.memberAvatars}>
                      {members.slice(0, 4).map((member) => (
                        <span
                          className={styles.avatar}
                          key={member.id}
                          title={member.user?.name || member.user?.email}
                        >
                          {initials(member.user)}
                        </span>
                      ))}
                      {members.length > 4 && (
                        <span className={styles.morePeople}>+{members.length - 4}</span>
                      )}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className={styles.emptyState}>
          <h2>Aucun projet</h2>
          <p>Créez votre premier projet pour commencer à organiser vos tâches.</p>
        </section>
      )}

      <dialog
        aria-labelledby="create-project-title"
        className={styles.dialog}
        onClose={() => {
          formRef.current?.reset();
          setSelectedContributors([]);
          setFormValid(false);
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
        ref={dialogRef}
      >
        <div className={styles.dialogHeader}>
          <h2 id="create-project-title">Créer un projet</h2>
          <button
            aria-label="Fermer la fenêtre"
            className={styles.iconButton}
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <form
          action={formAction}
          className={styles.dialogForm}
          onInput={(event) => setFormValid(event.currentTarget.checkValidity())}
          ref={formRef}
        >
          {state.status === "error" && (
            <p className={styles.errorBanner} role="alert">{state.message}</p>
          )}

          <label className={styles.formField}>
            <span>Titre*</span>
            <input aria-describedby="project-name-error" maxLength="100" name="name" required />
            {state.fieldErrors?.name && (
              <small className={styles.fieldError} id="project-name-error">
                {state.fieldErrors.name}
              </small>
            )}
          </label>

          <label className={styles.formField}>
            <span>Description*</span>
            <textarea maxLength="500" name="description" required rows="2" />
            {state.fieldErrors?.description && (
              <small className={styles.fieldError}>{state.fieldErrors.description}</small>
            )}
          </label>

          <div className={styles.formField}>
            <span>Contributeurs</span>
            <details className={styles.contributorDropdown}>
              <summary>
                {selectedContributors.length === 0
                  ? "Choisir un ou plusieurs collaborateurs"
                  : `${selectedContributors.length} collaborateur${selectedContributors.length > 1 ? "s" : ""}`}
              </summary>
              <div className={styles.contributorOptions}>
                {contributorOptions.length > 0 ? (
                  contributorOptions.map((person) => (
                    <label key={person.id}>
                      <input
                        checked={selectedContributors.includes(person.email)}
                        onChange={(event) => {
                          setSelectedContributors((current) =>
                            event.target.checked
                              ? [...current, person.email]
                              : current.filter((email) => email !== person.email)
                          );
                        }}
                        type="checkbox"
                      />
                      <span>{person.name || person.email}</span>
                    </label>
                  ))
                ) : (
                  <p>Aucun collaborateur disponible.</p>
                )}
              </div>
            </details>
            <input name="contributors" type="hidden" value={selectedContributors.join(",")} />
          </div>

          <div className={styles.dialogActions}>
            <button
              className={styles.addProjectButton}
              disabled={isPending || !formValid}
              type="submit"
            >
              {isPending ? "Ajout…" : "Ajouter un projet"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
