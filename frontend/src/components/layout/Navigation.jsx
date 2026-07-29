"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, LayoutDashboard } from "lucide-react";
import { mainNavigation } from "@/data/navigation";
import styles from "./Navigation.module.css";

const navigationIcons = {
  dashboard: LayoutDashboard,
  folder: Folder,
};

export default function Navigation() {
  const pathname = usePathname();

  const isCurrentRoute = (href) =>
    href === "/projets" ? pathname.startsWith(href) : pathname === href;

  return (
    <nav aria-label="Navigation principale" className={styles.navigation}>
      {mainNavigation.map((item) => {
        const isActive = isCurrentRoute(item.href);
        const Icon = navigationIcons[item.icon];

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`${styles.navigationLink} ${isActive ? styles.active : ""}`}
            href={item.href}
            key={item.href}
          >
            <Icon aria-hidden="true" size={24} strokeWidth={2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
