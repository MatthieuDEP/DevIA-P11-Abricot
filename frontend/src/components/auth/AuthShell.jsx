import Image from "next/image";
import Link from "next/link";
import styles from "./AuthShell.module.css";

export default function AuthShell({
  children,
  image,
  imageAlt,
  footerText,
  footerLinkLabel,
  footerLinkHref,
}) {
  return (
    <div className={styles.authShell}>
      <section className={styles.formPanel}>
        <Link aria-label="Abricot — accueil" className={styles.logo} href="/connexion">
          <Image
            alt="Abricot"
            height={33}
            priority
            sizes="(max-width: 820px) 175px, 253px"
            src="/brand/logo-orange.png"
            width={253}
          />
        </Link>

        <div className={styles.formContent}>{children}</div>

        <p className={styles.switchPage}>
          {footerText}{" "}
          <Link href={footerLinkHref}>{footerLinkLabel}</Link>
        </p>
      </section>

      <div className={styles.imagePanel}>
        <Image
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 820px) 0px, 62vw"
          src={image}
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
