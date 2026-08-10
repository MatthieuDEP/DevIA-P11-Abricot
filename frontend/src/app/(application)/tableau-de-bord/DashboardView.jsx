"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Folder, ListChecks, MessageSquare, Search } from "lucide-react";
import styles from "./page.module.css";

const statusLabels = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

const kanbanLabels = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminées",
};

const statusClasses = {
  TODO: "todo",
  IN_PROGRESS: "inProgress",
  DONE: "done",
  CANCELLED: "cancelled",
};

const kanbanColumns = ["TODO", "IN_PROGRESS", "DONE"];

function formatDate(date) {
  if (!date) return "Sans échéance";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

function matchesSearch(task, query) {
  if (!query) return true;
  return `${task.title} ${task.description || ""} ${task.project?.name || ""}`
    .toLocaleLowerCase("fr")
    .includes(query);
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

function TaskCard({ task }) {
  return (
    <article className={styles.taskCard}>
      <div className={styles.taskContent}>
        <h3>{task.title}</h3>
        <p>{task.description || "Aucune description."}</p>
        <TaskMeta task={task} />
      </div>
      <div className={styles.taskSide}>
        <span className={`${styles.status} ${styles[statusClasses[task.status]]}`}>
          {statusLabels[task.status] || task.status}
        </span>
        <Link className={styles.secondaryButton} href={`/projets/${task.project?.id}`}>Voir</Link>
      </div>
    </article>
  );
}

function KanbanCard({ task }) {
  return (
    <article className={styles.kanbanCard}>
      <div className={styles.kanbanTitle}>
        <h4>{task.title}</h4>
        <span className={`${styles.status} ${styles[statusClasses[task.status]]}`}>
          {statusLabels[task.status] || task.status}
        </span>
      </div>
      <p>{task.description || "Aucune description."}</p>
      <TaskMeta task={task} />
      <Link className={styles.secondaryButton} href={`/projets/${task.project?.id}`}>Voir</Link>
    </article>
  );
}

export default function DashboardView({ displayName, tasks }) {
  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("fr");

  const filteredTasks = useMemo(
    () => tasks.filter((task) => matchesSearch(task, normalizedQuery)),
    [tasks, normalizedQuery]
  );

  return (
    <div className={styles.pageStack}>
      <section className={styles.pageHeading}>
        <div>
          <h1>Tableau de bord</h1>
          <p>Bonjour {displayName}, voici un aperçu de vos projets et tâches</p>
        </div>
        <Link className={styles.primaryButton} href="/projets?create=1">＋ Créer un projet</Link>
      </section>

      <div aria-label="Choisir l’affichage" className={styles.viewSwitch} role="group">
        <button
          aria-pressed={view === "list"}
          className={view === "list" ? styles.selectedView : ""}
          onClick={() => setView("list")}
          type="button"
        >
          <ListChecks aria-hidden="true" size={18} /> Liste
        </button>
        <button
          aria-pressed={view === "kanban"}
          className={view === "kanban" ? styles.selectedView : ""}
          onClick={() => setView("kanban")}
          type="button"
        >
          <CalendarDays aria-hidden="true" size={18} /> Kanban
        </button>
      </div>

      {view === "list" ? (
        <section aria-labelledby="dashboard-content-title" className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2 id="dashboard-content-title">Mes tâches assignées</h2>
              <p>Par ordre de priorité</p>
            </div>
            <label className={styles.searchField}>
              <span className={styles.visuallyHidden}>Rechercher une tâche</span>
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une tâche"
                type="search"
                value={query}
              />
              <Search aria-hidden="true" size={18} />
            </label>
          </div>

          {filteredTasks.length > 0 ? (
            <div className={styles.taskList}>
              {filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>Aucune tâche</h3>
              <p>Aucune tâche ne correspond à cette recherche.</p>
            </div>
          )}
        </section>
      ) : (
        <div className={styles.kanban}>
          {kanbanColumns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column);

            return (
              <section className={styles.kanbanColumn} key={column}>
                <div className={styles.kanbanHeading}>
                  <h2>{kanbanLabels[column]}</h2>
                  <span>{columnTasks.length}</span>
                </div>
                <div className={styles.kanbanCards}>
                  {columnTasks.length > 0 ? (
                    columnTasks.map((task) => <KanbanCard key={task.id} task={task} />)
                  ) : (
                    <p className={styles.columnEmpty}>Aucune tâche</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
