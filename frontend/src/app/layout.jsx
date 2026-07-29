import "./globals.css";

export const metadata = {
  title: {
    default: "Abricot",
    template: "%s | Abricot",
  },
  description: "Gérez vos projets et vos tâches collaboratives avec Abricot.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
