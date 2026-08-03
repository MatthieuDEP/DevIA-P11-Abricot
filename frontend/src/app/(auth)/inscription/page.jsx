import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

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
      <SignupForm />
    </AuthShell>
  );
}
