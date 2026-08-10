import styles from "./layout.module.css";

export default function ApplicationLoading() {
  return (
    <div aria-busy="true" aria-label="Chargement de la page" className={styles.loadingStack}>
      <span />
      <span />
      <span />
    </div>
  );
}
