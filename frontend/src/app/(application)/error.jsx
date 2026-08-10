"use client";

import Link from "next/link";
import styles from "./layout.module.css";

export default function ApplicationError({ reset }) {
  return (
    <section className={styles.statePanel} role="alert">
      <p className={styles.stateEyebrow}>Service indisponible</p>
      <h1>Impossible de charger cette page</h1>
      <p>Le backend ne répond pas ou une erreur inattendue est survenue.</p>
      <div className={styles.stateActions}>
        <button onClick={reset} type="button">Réessayer</button>
        <Link href="/tableau-de-bord">Retour au tableau de bord</Link>
      </div>
    </section>
  );
}
