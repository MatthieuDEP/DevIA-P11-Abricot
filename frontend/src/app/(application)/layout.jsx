import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "./layout.module.css";

export default function ApplicationLayout({ children }) {
  return (
    <div className={styles.appShell}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
