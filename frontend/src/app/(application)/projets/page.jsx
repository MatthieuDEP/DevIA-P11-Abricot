import Link from "next/link";
import styles from "./page.module.css";

const projects = [
  {
    id: "refonte-api",
    title: "Refonte de l’API",
    description: "Développement de la nouvelle version de l’API REST avec authentification JWT",
    progress: 42,
    completed: 5,
    tasks: 12,
  },
  {
    id: "application-abricot",
    title: "Application Abricot",
    description: "Conception et développement du SaaS de gestion de projet collaboratif",
    progress: 68,
    completed: 17,
    tasks: 25,
  },
  {
    id: "recherche-utilisateur",
    title: "Recherche utilisateur",
    description: "Préparation des entretiens et analyse des retours de la première version",
    progress: 25,
    completed: 2,
    tasks: 8,
  },
  {
    id: "design-system",
    title: "Design system",
    description: "Création de composants cohérents, accessibles et réutilisables",
    progress: 54,
    completed: 7,
    tasks: 13,
  },
  {
    id: "strategie-contenu",
    title: "Stratégie de contenu",
    description: "Structuration des contenus d’aide et des messages de l’application",
    progress: 16,
    completed: 1,
    tasks: 6,
  },
  {
    id: "tests-qualite",
    title: "Tests et qualité",
    description: "Mise en place des contrôles automatiques et des scénarios fonctionnels",
    progress: 33,
    completed: 4,
    tasks: 12,
  },
];

export const metadata = {
  title: "Mes projets",
};

export default function ProjectsPage() {
  return (
    <div className={styles.pageStack}>
      <section className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>Espace projets</p>
          <h1>Mes projets</h1>
          <p>Gérez les projets auxquels vous participez.</p>
        </div>
        <button className={styles.primaryButton} type="button">
          <span aria-hidden="true">＋</span> Créer un projet
        </button>
      </section>

      <section aria-label="Liste des projets" className={styles.projectGrid}>
        {projects.map((project) => (
          <article className={styles.projectCard} key={project.id}>
            <div>
              <h2>
                <Link href={`/projets/${project.id}`}>{project.title}</Link>
              </h2>
              <p>{project.description}</p>
            </div>

            <div className={styles.progressBlock}>
              <div>
                <span>Progression</span>
                <strong>{project.progress}%</strong>
              </div>
              <div
                aria-label={`Progression : ${project.progress} %`}
                aria-valuemax="100"
                aria-valuemin="0"
                aria-valuenow={project.progress}
                className={styles.progressTrack}
                role="progressbar"
              >
                <span style={{ width: `${project.progress}%` }} />
              </div>
              <small>
                {project.completed}/{project.tasks} tâches terminées
              </small>
            </div>

            <div className={styles.teamBlock}>
              <p>Équipe (3)</p>
              <div className={styles.people}>
                <span className={styles.avatar}>AD</span>
                <span className={styles.ownerBadge}>Propriétaire</span>
                <span className={styles.avatar}>BD</span>
                <span className={styles.avatar}>CV</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
