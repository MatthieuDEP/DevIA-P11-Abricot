import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SkipLink from "@/components/accessibility/SkipLink";
import { requireUser } from "@/lib/auth";
import styles from "./layout.module.css";

export default async function ApplicationLayout({ children }) {
  const user = await requireUser();

  return (
    <div className={styles.appShell}>
      <SkipLink />
      <Header user={user} />
      <main className={styles.main} id="main-content" tabIndex={-1}>{children}</main>
      <Footer />
    </div>
  );
}
