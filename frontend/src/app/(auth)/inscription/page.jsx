import AuthShell from "@/components/auth/AuthShell";
import styles from "@/components/auth/AuthShell.module.css";

export const metadata = {
  title: "Inscription",
};

export default function SignupPage() {
  return (
    <AuthShell
      footerLinkHref="/connexion"
      footerLinkLabel="Se connecter"
      footerText="Déjà inscrit ?"
      image="/images/signup.jpg"
      imageAlt="Bureau organisé avec ordinateur, carnet et fournitures"
    >
      <h1>Inscription</h1>
      <form className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="signup-email">Adresse e-mail</label>
          <input autoComplete="email" id="signup-email" name="email" required type="email" />
        </div>
        <div className={styles.field}>
          <label htmlFor="signup-password">Mot de passe</label>
          <input
            aria-describedby="password-help"
            autoComplete="new-password"
            id="signup-password"
            minLength={8}
            name="password"
            required
            type="password"
          />
          <small id="password-help">8 caractères minimum</small>
        </div>
        <button className={styles.submitButton} type="submit">
          S’inscrire
        </button>
      </form>
    </AuthShell>
  );
}
