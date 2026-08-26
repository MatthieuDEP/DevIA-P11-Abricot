import Link from "next/link";
import { CalendarDays, Folder, MessageSquare } from "lucide-react";
import styles from "./DashboardTaskCards.module.css";

const statusLabels = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

const statusClasses = {
  TODO: "todo",
  IN_PROGRESS: "inProgress",
  DONE: "done",
  CANCELLED: "cancelled",
};

function formatDate(date) {
  if (!date) return "Sans échéance";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(date));
}

function TaskMeta({ task }) {
  return (
    <ul aria-label="Informations de la tâche" className={styles.taskMeta}>
      <li><Folder aria-hidden="true" size={18} /> {task.project?.name}</li>
      <li><CalendarDays aria-hidden="true" size={17} /> {formatDate(task.dueDate)}</li>
      <li><MessageSquare aria-hidden="true" size={17} /> {task.comments?.length || 0}</li>
    </ul>
  );
}

export function TaskCard({ task }) {
  return (
    <article className={styles.taskCard}>
      <div className={styles.taskContent}>
        <h3>{task.title}</h3>
        <p>{task.description || "Aucune description."}</p>
        <TaskMeta task={task} />
      </div>
      <div className={styles.taskSide}>
        <span className={styles.status + " " + styles[statusClasses[task.status]]}>{statusLabels[task.status] || task.status}</span>
        <Link className={styles.secondaryButton} href={"/projets/" + task.project?.id}>Voir</Link>
      </div>
    </article>
  );
}

export function KanbanCard({ task }) {
  return (
    <article className={styles.kanbanCard}>
      <div className={styles.kanbanTitle}>
        <h4>{task.title}</h4>
        <span className={styles.status + " " + styles[statusClasses[task.status]]}>{statusLabels[task.status] || task.status}</span>
      </div>
      <p>{task.description || "Aucune description."}</p>
      <TaskMeta task={task} />
      <Link className={styles.secondaryButton} href={"/projets/" + task.project?.id}>Voir</Link>
    </article>
  );
}
