"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import CreateProjectDialog from "./CreateProjectDialog";
import styles from "./ProjectsView.module.css";

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
  const [notice, setNotice] = useState(initialNotice);

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
        <CreateProjectDialog contributorOptions={contributorOptions} onCreated={setNotice} open={openCreateDialog} />
      </section>

      {notice && <p className={styles.successBanner} role="status">{notice}</p>}

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
    </div>
  );
}
