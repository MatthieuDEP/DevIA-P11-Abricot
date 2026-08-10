"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { createTaskAction, updateTaskAction } from "../actions";
import { dateInputValue } from "./project-utils";
import styles from "./TaskDialog.module.css";

const initialState = { status: "idle", message: "", fieldErrors: {} };

export default function TaskDialog({ mode, project, task, open, onClose, onNotice }) {
  const action =
    mode === "create"
      ? createTaskAction.bind(null, project.id)
      : updateTaskAction.bind(null, project.id, task.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const people = [project.owner, ...(project.members || []).map((member) => member.user)];
  const assignedIds = new Set((task?.assignees || []).map((assignee) => assignee.user.id));
  const [selectedAssignees, setSelectedAssignees] = useState([...assignedIds]);
  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
    if (open && !dialogRef.current?.open) dialogRef.current?.showModal();
    if (!open && dialogRef.current?.open) dialogRef.current?.close();
  }, [open]);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      onNotice(state.message);
      onClose();
    }
  }, [state, onClose, onNotice]);

  return (
    <dialog
      aria-labelledby="task-dialog-title"
      className={`${styles.dialog} ${styles.createTaskDialog}`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      ref={dialogRef}
    >
      <div className={`${styles.dialogHeader} ${styles.createTaskHeader}`}>
        <div>
          <h2 id="task-dialog-title">
            {mode === "create" ? "Créer une tâche" : "Modifier"}
          </h2>
        </div>
        <button aria-label="Fermer la fenêtre" className={styles.iconButton} onClick={onClose} type="button">
          <X aria-hidden="true" size={20} />
        </button>
      </div>

      <form
        action={formAction}
        className={`${styles.dialogForm} ${styles.createTaskForm}`}
        onInput={(event) => setFormValid(event.currentTarget.checkValidity())}
        ref={formRef}
      >
        {state.status === "error" && <p className={styles.errorBanner} role="alert">{state.message}</p>}

        <label className={styles.formField}>
          <span>Titre{mode === "create" ? "*" : ""}</span>
          <input defaultValue={task?.title || ""} maxLength="200" name="title" required />
          {state.fieldErrors?.title && <small className={styles.fieldError}>{state.fieldErrors.title}</small>}
        </label>

        <label className={styles.formField}>
          <span>Description{mode === "create" ? "*" : ""}</span>
          <textarea
            defaultValue={task?.description || ""}
            maxLength="1000"
            name="description"
            required={mode === "create"}
            rows={2}
          />
          {state.fieldErrors?.description && (
            <small className={styles.fieldError}>{state.fieldErrors.description}</small>
          )}
        </label>

        <label className={styles.formField}>
          <span>Échéance{mode === "create" ? "*" : ""}</span>
          <input
            defaultValue={dateInputValue(task?.dueDate)}
            name="dueDate"
            required={mode === "create"}
            type="date"
          />
        </label>

        <div className={styles.formField}>
          <span>Assigné à :</span>
          <details className={styles.assigneeDropdown}>
            <summary>
              {selectedAssignees.length === 0
                ? "Choisir un ou plusieurs collaborateurs"
                : `${selectedAssignees.length} collaborateur${selectedAssignees.length > 1 ? "s" : ""}`}
            </summary>
            <div className={styles.assigneeOptions}>
              {people.map((person) => (
                <label key={person.id}>
                  <input
                    checked={selectedAssignees.includes(person.id)}
                    name="assigneeIds"
                    onChange={(event) => {
                      setSelectedAssignees((current) =>
                        event.target.checked
                          ? [...current, person.id]
                          : current.filter((id) => id !== person.id)
                      );
                    }}
                    type="checkbox"
                    value={person.id}
                  />
                  <span>{person.name || person.email}</span>
                </label>
              ))}
            </div>
          </details>
        </div>

        <fieldset className={styles.statusFieldset}>
          <legend>Statut :</legend>
          <div className={styles.statusChoices}>
            <label className={styles.todoChoice}>
              <input
                defaultChecked={(task?.status || "TODO") === "TODO"}
                name="status"
                required
                type="radio"
                value="TODO"
              />
              <span>À faire</span>
            </label>
            <label className={styles.progressChoice}>
              <input
                defaultChecked={task?.status === "IN_PROGRESS"}
                name="status"
                type="radio"
                value="IN_PROGRESS"
              />
              <span>En cours</span>
            </label>
            <label className={styles.doneChoice}>
              <input
                defaultChecked={task?.status === "DONE"}
                name="status"
                type="radio"
                value="DONE"
              />
              <span>Terminée</span>
            </label>
          </div>
        </fieldset>
        <input name="priority" type="hidden" value={task?.priority || "MEDIUM"} />

        {mode === "create" ? (
          <div className={`${styles.dialogActions} ${styles.createTaskActions}`}>
            <button className={styles.addTaskButton} disabled={isPending || !formValid} type="submit">
              {isPending ? "Ajout…" : "+ Ajouter une tâche"}
            </button>
          </div>
        ) : (
          <div className={`${styles.dialogActions} ${styles.createTaskActions}`}>
            <button className={styles.saveTaskButton} disabled={isPending || !formValid} type="submit">
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        )}
      </form>
    </dialog>
  );
}
