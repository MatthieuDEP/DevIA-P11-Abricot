import Link from "next/link";
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
      <div className={styles.form}>
        <p className={styles.formNotice} role="status">
          La réinitialisation par e-mail n’est pas encore disponible dans l’API.
        </p>
        <Link className={styles.submitButton} href="/connexion">
          Revenir à la connexion
        </Link>
      </div>
    </AuthShell>
  );
}
