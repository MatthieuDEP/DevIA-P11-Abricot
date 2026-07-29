import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import styles from "@/components/auth/AuthShell.module.css";

export const metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return (
    <AuthShell
      footerLinkHref="/inscription"
      footerLinkLabel="Créer un compte"
      footerText="Pas encore de compte ?"
      image="/images/login.jpg"
      imageAlt="Bureau créatif avec clavier, carnet et fournitures"
    >
      <h1>Connexion</h1>
      <form className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="login-email">Adresse e-mail</label>
          <input autoComplete="email" id="login-email" name="email" required type="email" />
        </div>
        <div className={styles.field}>
          <label htmlFor="login-password">Mot de passe</label>
          <input
            autoComplete="current-password"
            id="login-password"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </div>
        <button className={styles.submitButton} type="submit">
          Se connecter
        </button>
        <Link className={styles.secondaryLink} href="/mot-de-passe-oublie">
          Mot de passe oublié ?
        </Link>
      </form>
    </AuthShell>
  );
}
