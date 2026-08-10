import { requireUser } from "@/lib/auth";
import AccountForms from "./AccountForms";
import styles from "./page.module.css";

export const metadata = {
  title: "Mon compte",
};

function splitName(name) {
  const words = (name || "").trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return { firstName: words[0] || "", lastName: "" };
  const [firstName, ...lastName] = words;
  return { firstName, lastName: lastName.join(" ") };
}

export default async function AccountPage() {
  const user = await requireUser();
  const names = splitName(user.name);

  return (
    <section className={`${styles.panel} ${styles.accountPanel}`}>
      <div className={styles.accountHeading}>
        <h1>Mon compte</h1>
        <p>{user.name || user.email}</p>
      </div>
      <AccountForms {...names} user={user} />
    </section>
  );
}
