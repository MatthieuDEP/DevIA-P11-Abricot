import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Connexion",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo =
    typeof params?.redirect === "string" ? params.redirect : "";
  const notice =
    params?.reason === "session-expired"
      ? "Votre session a expiré. Connectez-vous à nouveau."
      : params?.reason === "logged-out"
        ? "Vous êtes maintenant déconnecté."
        : "";

  return (
    <AuthShell
      footerLinkHref="/inscription"
      footerLinkLabel="Créer un compte"
      footerText="Pas encore de compte ?"
      image="/images/login.jpg"
      imageAlt="Bureau créatif avec clavier, carnet et fournitures"
    >
      <h1>Connexion</h1>
      <LoginForm notice={notice} redirectTo={redirectTo} />
    </AuthShell>
  );
}
