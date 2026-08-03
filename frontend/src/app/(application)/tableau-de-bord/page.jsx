import Link from "next/link";
import { requireUser } from "@/lib/auth";
import styles from "./page.module.css";

const tasks = [
  {
    id: 1,
    title: "Finaliser l’authentification JWT",
    description: "Sécuriser les accès à l’API et gérer le renouvellement des sessions.",
    project: "Refonte de l’API",
    date: "9 mars",
    comments: 2,
    status: "À faire",
    statusClass: "todo",
  },
  {
    id: 2,
    title: "Valider les maquettes mobiles",
    description: "Vérifier les principaux parcours sur téléphone et tablette.",
    project: "Application Abricot",
    date: "12 mars",
    comments: 4,
    status: "En cours",
    statusClass: "inProgress",
  },
  {
    id: 3,
    title: "Préparer les tests utilisateurs",
    description: "Rédiger le protocole et sélectionner les scénarios prioritaires.",
    project: "Recherche utilisateur",
    date: "18 mars",
    comments: 1,
    status: "Terminée",
    statusClass: "done",
  },
];

export const metadata = {
  title: "Tableau de bord",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const displayName = user.name || user.email;

  return (
    <div className={styles.pageStack}>
      <section className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>Votre espace de travail</p>
          <h1>Tableau de bord</h1>
          <p>Bonjour {displayName}, voici un aperçu de vos projets et tâches.</p>
        </div>
        <Link className={styles.primaryButton} href="/projets">
          <span aria-hidden="true">＋</span> Créer un projet
        </Link>
      </section>

      <div aria-label="Choisir l’affichage" className={styles.viewSwitch} role="group">
        <button aria-pressed="true" className={styles.selectedView} type="button">
          Liste
        </button>
        <button aria-pressed="false" type="button">
          Kanban
        </button>
      </div>

      <section aria-labelledby="assigned-tasks-title" className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 id="assigned-tasks-title">Mes tâches assignées</h2>
            <p>Par ordre de priorité</p>
          </div>
          <label className={styles.searchField}>
            <span className={styles.visuallyHidden}>Rechercher une tâche</span>
            <input placeholder="Rechercher une tâche" type="search" />
            <span aria-hidden="true">⌕</span>
          </label>
        </div>

        <div className={styles.taskList}>
          {tasks.map((task) => (
            <article className={styles.taskCard} key={task.id}>
              <div className={styles.taskContent}>
                <div className={styles.taskTitleRow}>
                  <h3>{task.title}</h3>
                  <span className={`${styles.status} ${styles[task.statusClass]}`}>{task.status}</span>
                </div>
                <p>{task.description}</p>
                <ul aria-label="Informations de la tâche" className={styles.taskMeta}>
                  <li>📁 {task.project}</li>
                  <li>▣ {task.date}</li>
                  <li>▤ {task.comments}</li>
                </ul>
              </div>
              <Link className={styles.secondaryButton} href="/projets/refonte-api">
                Voir
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
