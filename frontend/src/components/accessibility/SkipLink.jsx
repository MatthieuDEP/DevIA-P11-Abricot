import styles from "./SkipLink.module.css";

export default function SkipLink({ href = "#main-content" }) {
  return <a className={styles.skipLink} href={href}>Aller au contenu principal</a>;
}
