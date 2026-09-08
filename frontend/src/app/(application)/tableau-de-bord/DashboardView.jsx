"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, ListChecks, Search } from "lucide-react";
import { KanbanCard, TaskCard } from "./DashboardTaskCards";
import styles from "./DashboardView.module.css";

const kanbanLabels = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminées",
};

const kanbanColumns = ["TODO", "IN_PROGRESS", "DONE"];

function matchesSearch(task, query) {
  if (!query) return true;
  return `${task.title} ${task.description || ""} ${task.project?.name || ""}`
    .toLocaleLowerCase("fr")
    .includes(query);
}

function isTaskInMonth(task, referenceDate) {
  if (!task.dueDate) return false;

  const dueDate = new Date(task.dueDate);

  return (
    !Number.isNaN(dueDate.getTime()) &&
    dueDate.getMonth() === referenceDate.getMonth() &&
    dueDate.getFullYear() === referenceDate.getFullYear()
  );
}

export default function DashboardView({ displayName, tasks }) {
  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const [referenceMonth] = useState(() => new Date());
  const normalizedQuery = query.trim().toLocaleLowerCase("fr");

  const filteredTasks = useMemo(
    () => tasks.filter((task) => matchesSearch(task, normalizedQuery)),
    [tasks, normalizedQuery]
  );

  const monthlyTasks = useMemo(
    () => tasks.filter((task) => isTaskInMonth(task, referenceMonth)),
    [tasks, referenceMonth]
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
            const columnTasks = monthlyTasks.filter((task) => task.status === column);

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
