import AuthShell from "@/components/auth/AuthShell";
import styles from "@/components/auth/AuthShell.module.css";

export const metadata = {
  title: "Mot de passe oublié",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      footerLinkHref="/connexion"
      footerLinkLabel="Revenir à la connexion"
      footerText="Vous vous souvenez de votre mot de passe ?"
      image="/images/login.jpg"
      imageAlt="Bureau créatif avec clavier, carnet et fournitures"
    >
      <h1>Mot de passe oublié</h1>
      <p>Indiquez votre adresse e-mail pour recevoir les instructions de réinitialisation.</p>
      <form className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="reset-email">Adresse e-mail</label>
          <input autoComplete="email" id="reset-email" name="email" required type="email" />
        </div>
        <button className={styles.submitButton} type="submit">
          Envoyer les instructions
        </button>
      </form>
    </AuthShell>
  );
}
