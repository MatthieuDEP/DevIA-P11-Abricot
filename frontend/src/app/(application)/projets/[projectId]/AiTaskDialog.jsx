"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { LoaderCircle, Sparkle, X } from "lucide-react";
import { FaPen, FaTrash } from "react-icons/fa";
import {
  createGeneratedTasksAction,
  generateTasksAction,
} from "../actions";
import styles from "./AiTaskDialog.module.css";

const priorityLabels = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgente",
};

const statusLabels = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

function assignableUsers(project) {
  const users = [
    project.owner,
    ...(project.members || []).map((member) => member.user),
  ].filter(Boolean);

  return [...new Map(users.map((user) => [user.id, user])).values()];
}

function dateInputValue(value) {
  return value ? String(value).slice(0, 10) : "";
}

export default function AiTaskDialog({ onClose, onNotice, project }) {
  const [prompt, setPrompt] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [error, setError] = useState("");
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const dialogRef = useRef(null);
  const users = useMemo(() => assignableUsers(project), [project]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;

    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      if (dialog?.open) dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function generate(event) {
    event.preventDefault();
    setError("");

    startGenerating(async () => {
      try {
        const result = await generateTasksAction(project.id, prompt);

        if (result.status === "success") {
          setDrafts(result.tasks);
          setPrompt("");
          setEditingIndex(null);
        } else {
          setError(result.message);
        }
      } catch {
        setError("La génération n’a pas pu démarrer. Réessayez.");
      }
    });
  }

  function updateDraft(index, field, value) {
    setDrafts((current) =>
      current.map((task, taskIndex) =>
        taskIndex === index ? { ...task, [field]: value } : task
      )
    );
  }

  function removeDraft(index) {
    setDrafts((current) => current.filter((_, taskIndex) => taskIndex !== index));
    setEditingIndex((current) => {
      if (current === index) return null;
      return current > index ? current - 1 : current;
    });
  }

  function saveTasks() {
    setError("");

    startSaving(async () => {
      try {
        const result = await createGeneratedTasksAction(project.id, drafts);

        if (result.status === "success") {
          onNotice(result.message, "success");
          dialogRef.current?.close();
          onClose();
        } else {
          setError(result.message);
        }
      } catch {
        setError("Les tâches n’ont pas pu être enregistrées. Réessayez.");
      }
    });
  }

  const busy = isGenerating || isSaving;

  function closeDialog() {
    if (busy) return;
    dialogRef.current?.close();
    onClose();
  }

  function keepFocusInside(event) {
    if (event.key !== "Tab") return;

    const dialog = dialogRef.current;
    const focusable = dialog
      ? [...dialog.querySelectorAll(
          "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])"
        )].filter((element) => !element.hidden && element.getClientRects().length > 0)
      : [];

    if (focusable.length === 0) {
      event.preventDefault();
      dialog?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <dialog
      aria-labelledby="ai-task-dialog-title"
      className={styles.aiDialogOverlay}
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
      onKeyDown={keepFocusInside}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
      ref={dialogRef}
      tabIndex={-1}
    >
      <section
        aria-busy={busy}
        className={`${styles.aiDialog} ${drafts.length > 0 ? styles.aiDialogResults : styles.aiDialogCreate}`}
      >
        <button
          aria-label="Fermer"
          className={styles.aiDialogClose}
          disabled={busy}
          onClick={closeDialog}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>

        <header className={styles.aiDialogHeader}>
          <h2 id="ai-task-dialog-title">
            <Sparkle aria-hidden="true" size={20} />
            {drafts.length > 0 ? "Vos tâches..." : "Créer une tâche"}
          </h2>
        </header>

        <p aria-live="polite" className={styles.visuallyHidden} role="status">
          {isGenerating
            ? "Génération des tâches en cours."
            : drafts.length > 0
              ? drafts.length + " tâche" + (drafts.length > 1 ? "s générées." : " générée.")
              : ""}
        </p>

        <div className={styles.aiDialogContent}>
          {drafts.length === 0 ? (
            <div className={styles.aiEmpty}>
              {isGenerating && (
                <>
                  <LoaderCircle aria-hidden="true" className={styles.spinning} size={32} />
                  <p>Mistral analyse le projet et prépare vos tâches…</p>
                </>
              )}
            </div>
          ) : (
            <div className={styles.aiDraftList}>
              {drafts.map((task, index) => (
                <article
                  className={`${styles.aiDraftCard} ${editingIndex === index ? styles.aiDraftCardEditing : ""}`}
                  key={`${task.title}-${index}`}
                >
                  {editingIndex === index ? (
                    <div className={styles.aiDraftEditor}>
                      <label>
                        <span>Titre</span>
                        <input
                          maxLength={200}
                          onChange={(event) => updateDraft(index, "title", event.target.value)}
                          value={task.title}
                        />
                      </label>
                      <label>
                        <span>Description</span>
                        <textarea
                          maxLength={1000}
                          onChange={(event) => updateDraft(index, "description", event.target.value)}
                          rows={3}
                          value={task.description}
                        />
                      </label>
                      <div className={styles.aiDraftFields}>
                        <label>
                          <span>Priorité</span>
                          <select
                            onChange={(event) => updateDraft(index, "priority", event.target.value)}
                            value={task.priority}
                          >
                            {Object.entries(priorityLabels).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Statut</span>
                          <select
                            onChange={(event) => updateDraft(index, "status", event.target.value)}
                            value={task.status}
                          >
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Échéance</span>
                          <input
                            onChange={(event) => updateDraft(
                              index,
                              "dueDate",
                              event.target.value
                                ? `${event.target.value}T12:00:00.000Z`
                                : null
                            )}
                            type="date"
                            value={dateInputValue(task.dueDate)}
                          />
                        </label>
                      </div>
                      <label>
                        <span>Assignée à</span>
                        <select
                          multiple
                          onChange={(event) => updateDraft(
                            index,
                            "assigneeIds",
                            [...event.target.selectedOptions].map((option) => option.value)
                          )}
                          value={task.assigneeIds}
                        >
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name || user.email}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        className={styles.aiEditorDone}
                        onClick={() => setEditingIndex(null)}
                        type="button"
                      >
                        Terminer
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3>{task.title}</h3>
                      <p>{task.description || "Aucune description."}</p>
                      <div className={styles.aiDraftActions}>
                        <button onClick={() => removeDraft(index)} type="button">
                          <FaTrash aria-hidden="true" size={14} />
                          Supprimer
                        </button>
                        <span aria-hidden="true" />
                        <button onClick={() => setEditingIndex(index)} type="button">
                          <FaPen aria-hidden="true" size={14} />
                          Modifier
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        {error && <p className={styles.aiDialogError} role="alert">{error}</p>}

        {drafts.length > 0 && (
          <button
            className={styles.aiAddTasksButton}
            disabled={busy || drafts.length === 0 || editingIndex !== null}
            onClick={saveTasks}
            type="button"
          >
            {isSaving ? (
              <><LoaderCircle aria-hidden="true" className={styles.spinning} size={18} /> Ajout en cours…</>
            ) : (
              <>+ Ajouter les tâches</>
            )}
          </button>
        )}

        <div className={styles.aiPromptArea}>
          <form className={styles.aiPromptForm} onSubmit={generate}>
            <label>
              <span className={styles.visuallyHidden}>Décrivez les tâches à générer</span>
              <textarea
                disabled={busy}
                maxLength={2000}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Décrivez les tâches que vous souhaitez ajouter..."
                rows={1}
                value={prompt}
              />
            </label>
            <button
              aria-label="Générer les tâches"
              disabled={busy || prompt.trim().length < 10}
              type="submit"
            >
              {isGenerating ? (
                <LoaderCircle aria-hidden="true" className={styles.spinning} size={15} />
              ) : (
                <Sparkle aria-hidden="true" size={11} />
              )}
            </button>
          </form>
        </div>
      </section>
    </dialog>
  );
}
