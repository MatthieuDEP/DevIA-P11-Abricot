import { requireUser } from "@/lib/auth";
import styles from "./page.module.css";

export const metadata = {
  title: "Mon compte",
};

function splitName(name) {
  const words = (name || "").trim().split(/\s+/).filter(Boolean);

  if (words.length < 2) {
    return { firstName: "", lastName: words[0] || "" };
  }

  const [firstName, ...lastName] = words;
  return { firstName, lastName: lastName.join(" ") };
}

export default async function AccountPage() {
  const user = await requireUser();
  const displayName = user.name || user.email;
  const { firstName, lastName } = splitName(user.name);

  return (
    <section className={`${styles.panel} ${styles.accountPanel}`}>
      <div className={styles.accountHeading}>
        <p className={styles.eyebrow}>Profil</p>
        <h1>Mon compte</h1>
        <p>{displayName}</p>
      </div>

      <div className={styles.accountForm}>
        <label className={styles.formField}>
          <span>Nom</span>
          <input
            autoComplete="family-name"
            className={styles.readOnlyField}
            name="lastName"
            readOnly
            type="text"
            value={lastName}
          />
        </label>
        <label className={styles.formField}>
          <span>Prénom</span>
          <input
            autoComplete="given-name"
            className={styles.readOnlyField}
            name="firstName"
            readOnly
            type="text"
            value={firstName}
          />
        </label>
        <label className={styles.formField}>
          <span>Adresse e-mail</span>
          <input
            autoComplete="email"
            className={styles.readOnlyField}
            name="email"
            readOnly
            type="email"
            value={user.email}
          />
        </label>
        <label className={styles.formField}>
          <span>Mot de passe</span>
          <input
            autoComplete="current-password"
            className={styles.readOnlyField}
            name="password"
            placeholder="••••••••••••"
            readOnly
            type="password"
          />
        </label>
        <div className={styles.profileActions}>
          <p>
            La modification des informations sera connectée lors de l’étape dédiée à la gestion du profil.
          </p>
          <form action="/api/auth/logout" method="post">
            <button className={styles.primaryButton} type="submit">
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
