import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <Link aria-label="Retour au tableau de bord" href="/tableau-de-bord">
          <Image
            alt="Abricot"
            height={33}
            sizes="102px"
            src="/brand/logo-black.png"
            width={253}
          />
        </Link>
        <p>Abricot {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
