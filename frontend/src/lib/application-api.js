import "server-only";

import { redirect } from "next/navigation";
import { ApiError, apiRequest } from "./api";
import { getSessionToken } from "./auth";

export async function authenticatedApiRequest(path, options = {}) {
  const token = await getSessionToken();

  if (!token) {
    redirect("/api/auth/logout?reason=session-expired");
  }

  try {
    return await apiRequest(path, { ...options, token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/api/auth/logout?reason=session-expired");
    }

    throw error;
  }
}

export async function getProjects() {
  const response = await authenticatedApiRequest("/projects");
  return response?.data?.projects || [];
}

export async function getProjectWorkspace(projectId) {
  const safeProjectId = encodeURIComponent(projectId);
  const [projectResponse, tasksResponse] = await Promise.all([
    authenticatedApiRequest(`/projects/${safeProjectId}`),
    authenticatedApiRequest(`/projects/${safeProjectId}/tasks`),
  ]);

  return {
    project: projectResponse?.data?.project || null,
    tasks: tasksResponse?.data?.tasks || [],
  };
}

export async function getDashboard() {
  const [tasksResponse, projectsResponse, statsResponse] = await Promise.all([
    authenticatedApiRequest("/dashboard/assigned-tasks"),
    authenticatedApiRequest("/dashboard/projects-with-tasks"),
    authenticatedApiRequest("/dashboard/stats"),
  ]);

  return {
    tasks: tasksResponse?.data?.tasks || [],
    projects: projectsResponse?.data?.projects || [],
    stats: statsResponse?.data?.stats || null,
  };
}
