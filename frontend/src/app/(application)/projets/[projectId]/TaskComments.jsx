"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
} from "../actions";
import { formatDate, initials } from "./project-utils";
import styles from "./TaskComments.module.css";

const initialState = { status: "idle", message: "", fieldErrors: {} };

function CommentItem({ comment, currentUser, isAdmin, projectId, taskId, onNotice }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateCommentAction.bind(null, projectId, taskId, comment.id),
    initialState
  );
  const [isDeleting, startTransition] = useTransition();
  const isAuthor = comment.author?.id === currentUser.id;

  useEffect(() => {
    if (state.status === "success") {
      onNotice(state.message);
    }
  }, [state, onNotice]);

  const isEditing = editing && state.status !== "success";

  function remove() {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    startTransition(async () => {
      const result = await deleteCommentAction(projectId, taskId, comment.id);
      onNotice(result.message, result.status);
    });
  }

  return (
    <li className={styles.commentItem}>
      <span className={styles.avatar}>{initials(comment.author)}</span>
      <div className={styles.commentContent}>
        <div className={styles.commentHeading}>
          <strong>{comment.author?.name || comment.author?.email}</strong>
          <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
        </div>
        {isEditing ? (
          <form action={formAction} className={styles.commentEditForm}>
            <textarea defaultValue={comment.content} maxLength="2000" name="content" required rows="2" />
            {state.status === "error" && <small className={styles.fieldError}>{state.message}</small>}
            <div>
              <button onClick={() => setEditing(false)} type="button">Annuler</button>
              <button disabled={isPending} type="submit">{isPending ? "Enregistrement…" : "Enregistrer"}</button>
            </div>
          </form>
        ) : (
          <p>{comment.content}</p>
        )}
      </div>
      {!isEditing && (isAuthor || isAdmin) && (
        <div className={styles.commentActions}>
          {isAuthor && (
            <button aria-label="Modifier le commentaire" onClick={() => setEditing(true)} type="button">
              <Pencil aria-hidden="true" size={15} />
            </button>
          )}
          <button aria-label="Supprimer le commentaire" disabled={isDeleting} onClick={remove} type="button">
            <Trash2 aria-hidden="true" size={15} />
          </button>
        </div>
      )}
    </li>
  );
}

export default function TaskComments({ task, projectId, currentUser, isAdmin, onNotice }) {
  const [state, formAction, isPending] = useActionState(
    createCommentAction.bind(null, projectId, task.id),
    initialState
  );
  const formRef = useRef(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      onNotice(state.message);
    }
  }, [state, onNotice]);

  return (
    <div className={styles.commentsPanel}>
      {(task.comments || []).length > 0 ? (
        <ul className={styles.commentList}>
          {task.comments.map((comment) => (
            <CommentItem
              comment={comment}
              currentUser={currentUser}
              isAdmin={isAdmin}
              key={comment.id}
              onNotice={onNotice}
              projectId={projectId}
              taskId={task.id}
            />
          ))}
        </ul>
      ) : (
        <p className={styles.noComments}>Aucun commentaire pour le moment.</p>
      )}
      <form action={formAction} className={styles.commentForm} ref={formRef}>
        <label>
          <span className={styles.visuallyHidden}>Ajouter un commentaire</span>
          <textarea maxLength="2000" name="content" placeholder="Ajouter un commentaire…" required rows="2" />
        </label>
        {state.status === "error" && <small className={styles.fieldError}>{state.fieldErrors?.content || state.message}</small>}
        <button className={styles.secondaryButton} disabled={isPending} type="submit">
          {isPending ? "Envoi…" : "Commenter"}
        </button>
      </form>
    </div>
  );
}
