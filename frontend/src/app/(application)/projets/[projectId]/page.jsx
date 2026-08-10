import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getProjectWorkspace } from "@/lib/application-api";
import { requireUser } from "@/lib/auth";
import ProjectWorkspace from "./ProjectWorkspace";

export const metadata = {
  title: "Projet",
};

export default async function ProjectPage({ params }) {
  const { projectId } = await params;
  let workspace;
  let user;

  try {
    [workspace, user] = await Promise.all([
      getProjectWorkspace(projectId),
      requireUser(),
    ]);
  } catch (error) {
    if (error instanceof ApiError && [403, 404].includes(error.status)) {
      notFound();
    }

    throw error;
  }

  if (!workspace.project) notFound();

  return <ProjectWorkspace currentUser={user} {...workspace} />;
}
