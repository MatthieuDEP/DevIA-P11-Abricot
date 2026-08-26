import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SkipLink from "@/components/accessibility/SkipLink";

export default async function AuthLayout({ children }) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/tableau-de-bord");
  }

  return (
    <>
      <SkipLink />
      <main id="main-content" tabIndex={-1}>{children}</main>
    </>
  );
}
