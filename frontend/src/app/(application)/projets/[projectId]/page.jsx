import Link from "next/link";
import styles from "./page.module.css";

const projectTasks = [
  {
    id: 1,
    title: "Authentification JWT",
    description: "Implémenter le système d’authentification avec renouvellement des jetons.",
    dueDate: "9 mars",
    status: "À faire",
    statusClass: "todo",
  },
  {
    id: 2,
    title: "Documentation de l’API",
    description: "Documenter les routes et les exemples de réponses de l’API.",
    dueDate: "12 mars",
    status: "En cours",
    statusClass: "inProgress",
  },
  {
    id: 3,
    title: "Tests d’intégration",
    description: "Couvrir les parcours critiques de création et de mise à jour.",
    dueDate: "15 mars",
    status: "Terminée",
    statusClass: "done",
  },
];

function formatProjectName(projectId) {
  return decodeURIComponent(projectId)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { projectId } = await params;

  return {
    title: formatProjectName(projectId) || "Projet",
  };
}

export default async function ProjectPage({ params }) {
  const { projectId } = await params;
  const projectName = formatProjectName(projectId) || "Projet";

  return (
    <div className={styles.pageStack}>
      <section className={styles.projectHeading}>
        <Link aria-label="Retour aux projets" className={styles.backButton} href="/projets">
          ←
        </Link>
        <div className={styles.projectTitle}>
          <div>
            <h1>{projectName}</h1>
            <button className={styles.textButton} type="button">
              Modifier
            </button>
          </div>
          <p>Développement de la nouvelle version de l’API REST avec authentification JWT.</p>
        </div>
        <div className={styles.projectActions}>
          <button className={styles.primaryButton} type="button">
            Créer une tâche
          </button>
          <button className={styles.aiButton} type="button">
            ✦ IA
          </button>
        </div>
      </section>

      <section aria-labelledby="contributors-title" className={styles.contributors}>
        <div>
          <h2 id="contributors-title">Contributeurs</h2>
          <span>3 personnes</span>
        </div>
        <div className={styles.people}>
          <span className={styles.avatar}>AD</span>
          <span className={styles.ownerBadge}>Propriétaire</span>
          <span className={styles.avatar}>BD</span>
          <span className={styles.personBadge}>Bertrand Dupont</span>
          <span className={styles.avatar}>AD</span>
          <span className={styles.personBadge}>Anne Dupont</span>
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
              <button aria-pressed="true" className={styles.selectedView} type="button">
                Liste
              </button>
              <button aria-pressed="false" type="button">
                Calendrier
              </button>
            </div>
            <label className={styles.selectField}>
              <span className={styles.visuallyHidden}>Filtrer par statut</span>
              <select defaultValue="">
                <option value="">Tous les statuts</option>
                <option value="todo">À faire</option>
                <option value="in-progress">En cours</option>
                <option value="done">Terminée</option>
              </select>
            </label>
          </div>
        </div>

        <div className={styles.taskList}>
          {projectTasks.map((task) => (
            <article className={styles.projectTask} key={task.id}>
              <div className={styles.taskTitleRow}>
                <h3>{task.title}</h3>
                <span className={`${styles.status} ${styles[task.statusClass]}`}>{task.status}</span>
              </div>
              <p>{task.description}</p>
              <dl className={styles.taskDetails}>
                <div>
                  <dt>Échéance</dt>
                  <dd>▣ {task.dueDate}</dd>
                </div>
                <div>
                  <dt>Assignée à</dt>
                  <dd className={styles.people}>
                    <span className={styles.avatar}>BD</span>
                    <span className={styles.personBadge}>Bertrand Dupont</span>
                    <span className={styles.avatar}>AD</span>
                    <span className={styles.personBadge}>Anne Dupont</span>
                  </dd>
                </div>
              </dl>
              <div className={styles.commentsRow}>
                <span>Commentaires (1)</span>
                <button aria-label={`Options pour ${task.title}`} type="button">
                  •••
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
