import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata = {
  title: "Page introuvable",
};

export default function NotFound() {
  return (
    <main className={styles.notFound}>
      <p className={styles.errorCode}>404</p>
      <h1>Cette page n’existe pas</h1>
      <p>Le contenu recherché a peut-être été déplacé ou supprimé.</p>
      <Link className={styles.primaryButton} href="/tableau-de-bord">
        Retour au tableau de bord
      </Link>
    </main>
  );
}
