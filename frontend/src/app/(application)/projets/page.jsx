import { getProjects } from "@/lib/application-api";
import { getCurrentUser } from "@/lib/auth";
import ProjectsView from "./ProjectsView";

export const metadata = {
  title: "Mes projets",
};

export default async function ProjectsPage({ searchParams }) {
  const [projects, parameters, currentUser] = await Promise.all([
    getProjects(),
    searchParams,
    getCurrentUser(),
  ]);

  return (
    <ProjectsView
      currentUserId={currentUser?.id}
      initialNotice={
        parameters?.notice === "project-deleted"
          ? "Le projet a bien été supprimé."
          : ""
      }
      openCreateDialog={parameters?.create === "1"}
      projects={projects}
    />
  );
}
