"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import styles from "./Header.module.css";

function getInitials(user) {
  const source = user?.name?.trim() || user?.email || "Utilisateur";
  const words = source.split(/[\s@._-]+/).filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export default function Header({ user }) {
  const pathname = usePathname();
  const isAccountPage = pathname === "/mon-compte";
  const initials = getInitials(user);
  const accountLabel = user?.name
    ? `Ouvrir le compte de ${user.name}`
    : "Ouvrir mon compte";

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link aria-label="Abricot — tableau de bord" className={styles.logoLink} href="/tableau-de-bord">
          <Image
            alt="Abricot"
            height={33}
            priority
            sizes="(max-width: 600px) 130px, 150px"
            src="/brand/logo-orange.png"
            width={253}
          />
        </Link>
        <Navigation />
        <Link
          aria-current={isAccountPage ? "page" : undefined}
          aria-label={accountLabel}
          className={`${styles.userMenu} ${isAccountPage ? styles.userMenuActive : ""}`}
          href="/mon-compte"
          title="Mon compte"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
