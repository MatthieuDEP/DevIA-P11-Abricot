import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { requireUser } from "@/lib/auth";
import styles from "./layout.module.css";

export default async function ApplicationLayout({ children }) {
  const user = await requireUser();

  return (
    <div className={styles.appShell}>
      <Header user={user} />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
