import styles from "./page.module.css";

export const metadata = {
  title: "Mon compte",
};

export default function AccountPage() {
  return (
    <section className={`${styles.panel} ${styles.accountPanel}`}>
      <div className={styles.accountHeading}>
        <p className={styles.eyebrow}>Profil</p>
        <h1>Mon compte</h1>
        <p>Amélie Dupont</p>
      </div>

      <form className={styles.accountForm}>
        <label className={styles.formField}>
          <span>Nom</span>
          <input autoComplete="family-name" defaultValue="Dupont" name="lastName" type="text" />
        </label>
        <label className={styles.formField}>
          <span>Prénom</span>
          <input autoComplete="given-name" defaultValue="Amélie" name="firstName" type="text" />
        </label>
        <label className={styles.formField}>
          <span>Adresse e-mail</span>
          <input autoComplete="email" defaultValue="a.dupont@mail.com" name="email" type="email" />
        </label>
        <label className={styles.formField}>
          <span>Mot de passe</span>
          <input
            autoComplete="current-password"
            name="password"
            placeholder="••••••••••••"
            type="password"
          />
        </label>
        <button className={styles.primaryButton} type="submit">
          Modifier les informations
        </button>
      </form>
    </section>
  );
}
