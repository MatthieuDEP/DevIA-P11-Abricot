"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";
import { CalendarDays, ChevronDown, ChevronUp, ListChecks, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import { deleteTaskAction } from "../actions";
import ProjectDialog from "./ProjectDialog";
import TaskComments from "./TaskComments";
import TaskDialog from "./TaskDialog";
import {
  formatDate,
  initials,
  priorityLabels,
  statusClasses,
  statusLabels,
} from "./project-utils";
import styles from "./page.module.css";

function TaskCard({ task, currentUser, isAdmin, projectId, expanded, onEdit, onExpand, onNotice }) {
  const [isDeleting, startTransition] = useTransition();

  function removeTask() {
    if (!window.confirm(`Supprimer la tâche « ${task.title} » ?`)) return;
    startTransition(async () => {
      const result = await deleteTaskAction(projectId, task.id);
      onNotice(result.message, result.status);
    });
  }

  return (
    <article className={styles.projectTask}>
      <div className={styles.taskTitleRow}>
        <div>
          <h3>{task.title}</h3>
          <span className={`${styles.status} ${styles[statusClasses[task.status]]}`}>
            {statusLabels[task.status] || task.status}
          </span>
        </div>
        <details className={styles.taskMenu}>
          <summary aria-label={`Actions pour ${task.title}`}>
            <MoreHorizontal aria-hidden="true" size={20} />
          </summary>
          <div>
            {isAdmin && (
              <button onClick={onEdit} type="button">
                <Pencil aria-hidden="true" size={15} /> Modifier
              </button>
            )}
            <button disabled={isDeleting} onClick={removeTask} type="button">
              <Trash2 aria-hidden="true" size={15} /> Supprimer
            </button>
          </div>
        </details>
      </div>
      <p>{task.description || "Aucune description."}</p>
      <dl className={styles.taskDetails}>
        <div>
          <dt>Échéance</dt>
          <dd><CalendarDays aria-hidden="true" size={16} /> {formatDate(task.dueDate)}</dd>
        </div>
        <div>
          <dt>Assignée à</dt>
          <dd className={styles.people}>
            {(task.assignees || []).length > 0 ? task.assignees.map((assignee) => (
              <span className={styles.personCompact} key={assignee.id} title={assignee.user.email}>
                <span className={styles.avatar}>{initials(assignee.user)}</span>
                <span className={styles.personBadge}>{assignee.user.name || assignee.user.email}</span>
              </span>
            )) : <span className={styles.mutedText}>Personne</span>}
          </dd>
        </div>
      </dl>
      <div className={styles.commentsRow}>
        <button className={styles.commentsToggle} onClick={onExpand} type="button">
          <span>Commentaires ({task.comments?.length || 0})</span>
          {expanded ? <ChevronUp aria-hidden="true" size={17} /> : <ChevronDown aria-hidden="true" size={17} />}
        </button>
      </div>
      {expanded && (
        <TaskComments
          currentUser={currentUser}
          isAdmin={isAdmin}
          onNotice={onNotice}
          projectId={projectId}
          task={task}
        />
      )}
    </article>
  );
}

export default function ProjectWorkspace({ project, tasks, currentUser }) {
  const [view, setView] = useState("list");
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState(null);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const isAdmin = project.userRole === "ADMIN";

  const handleNotice = useCallback((message, type = "success") => {
    setNotice({ message, type });
  }, []);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    return tasks.filter((task) => {
      const matchesStatus = status === "ALL" || task.status === status;
      const matchesQuery =
        !normalizedQuery ||
        `${task.title} ${task.description || ""}`
          .toLocaleLowerCase("fr")
          .includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [tasks, status, query]);

  const calendarGroups = useMemo(() => {
    const groups = new Map();
    filteredTasks.forEach((task) => {
      const key = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "none";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(task);
    });
    return [...groups.entries()].sort(([first], [second]) => {
      if (first === "none") return 1;
      if (second === "none") return -1;
      return first.localeCompare(second);
    });
  }, [filteredTasks]);

  const members = project.members || [];

  return (
    <div className={styles.pageStack}>
      <section className={styles.projectHeading}>
        <Link aria-label="Retour aux projets" className={styles.backButton} href="/projets">←</Link>
        <div className={styles.projectTitle}>
          <div>
            <h1>{project.name}</h1>
            {isAdmin && <button className={styles.textButton} onClick={() => setProjectDialogOpen(true)} type="button">Modifier</button>}
          </div>
          <p>{project.description || "Aucune description pour ce projet."}</p>
        </div>
        <div className={styles.projectActions}>
          <button className={styles.primaryButton} onClick={() => setTaskDialogOpen(true)} type="button">Créer une tâche</button>
          <button aria-disabled="true" className={styles.aiButton} disabled title="La génération automatique sera intégrée ultérieurement" type="button">✦ IA</button>
        </div>
      </section>

      {notice && (
        <p className={notice.type === "error" ? styles.errorBanner : styles.successBanner} role={notice.type === "error" ? "alert" : "status"}>
          {notice.message}
        </p>
      )}

      <section aria-labelledby="contributors-title" className={styles.contributors}>
        <div>
          <h2 id="contributors-title">Contributeurs</h2>
          <span>{members.length + 1} personne{members.length > 0 ? "s" : ""}</span>
        </div>
        <div className={styles.people}>
          <span className={styles.avatar}>{initials(project.owner)}</span>
          <span className={styles.ownerBadge}>Propriétaire</span>
          {members.map((member) => (
            <span className={styles.personCompact} key={member.id}>
              <span className={styles.avatar}>{initials(member.user)}</span>
              <span className={styles.personBadge}>{member.user.name || member.user.email}</span>
            </span>
          ))}
        </div>
      </section>

      <section aria-labelledby="project-tasks-title" className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 id="project-tasks-title">Tâches</h2>
            <p>Par ordre de priorité</p>
          </div>
          <div className={styles.taskTools}>
            <div aria-label="Choisir l’affichage" className={styles.viewSwitch} role="group">
              <button aria-pressed={view === "list"} className={view === "list" ? styles.selectedView : ""} onClick={() => setView("list")} type="button"><ListChecks aria-hidden="true" size={17} /> Liste</button>
              <button aria-pressed={view === "calendar"} className={view === "calendar" ? styles.selectedView : ""} onClick={() => setView("calendar")} type="button"><CalendarDays aria-hidden="true" size={17} /> Calendrier</button>
            </div>
            <label className={styles.selectField}>
              <span className={styles.visuallyHidden}>Filtrer par statut</span>
              <select onChange={(event) => setStatus(event.target.value)} value={status}>
                <option value="ALL">Statut</option>
                <option value="TODO">À faire</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="DONE">Terminée</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </label>
            <label className={styles.searchField}>
              <span className={styles.visuallyHidden}>Rechercher une tâche</span>
              <input onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une tâche" type="search" value={query} />
              <Search aria-hidden="true" size={17} />
            </label>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>Aucune tâche</h3>
            <p>{tasks.length === 0 ? "Créez la première tâche de ce projet." : "Modifiez les filtres pour afficher d’autres tâches."}</p>
          </div>
        ) : view === "list" ? (
          <div className={styles.taskList}>
            {filteredTasks.map((task) => (
              <TaskCard
                currentUser={currentUser}
                expanded={expandedTaskId === task.id}
                isAdmin={isAdmin}
                key={task.id}
                onEdit={() => setSelectedTask(task)}
                onExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                onNotice={handleNotice}
                projectId={project.id}
                task={task}
              />
            ))}
          </div>
        ) : (
          <div className={styles.calendarView}>
            {calendarGroups.map(([date, groupedTasks]) => (
              <section className={styles.calendarDay} key={date}>
                <h3>{date === "none" ? "Sans échéance" : formatDate(date)}</h3>
                <div>
                  {groupedTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        if (isAdmin) {
                          setSelectedTask(task);
                        } else {
                          setView("list");
                          setExpandedTaskId(task.id);
                        }
                      }}
                      type="button"
                    >
                      <span className={`${styles.statusDot} ${styles[statusClasses[task.status]]}`} />
                      <span><strong>{task.title}</strong><small>{statusLabels[task.status]} · {priorityLabels[task.priority]}</small></span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      {projectDialogOpen && (
        <ProjectDialog key={project.updatedAt} onClose={() => setProjectDialogOpen(false)} onNotice={handleNotice} open project={project} />
      )}
      {taskDialogOpen && (
        <TaskDialog key="new-task" mode="create" onClose={() => setTaskDialogOpen(false)} onNotice={handleNotice} open project={project} />
      )}
      {selectedTask && isAdmin && (
        <TaskDialog key={selectedTask.id} mode="edit" onClose={() => setSelectedTask(null)} onNotice={handleNotice} open project={project} task={selectedTask} />
      )}
    </div>
  );
}
