import { Document } from "@llamaindex/core/schema";

function userLabel(user) {
  return user?.name || user?.email || "Utilisateur inconnu";
}

export function projectUsers(project) {
  const users = [project.owner, ...(project.members || []).map((member) => member.user)]
    .filter(Boolean);
  return [...new Map(users.map((user) => [user.id, user])).values()];
}

export function buildContextDocuments(project, tasks, currentDate) {
  const users = projectUsers(project);
  const documents = [
    new Document({
      text: [
        `Projet : ${project.name}`,
        `Description : ${project.description || "Aucune description"}`,
        `Date actuelle : ${currentDate}`,
      ].join("\n"),
      metadata: { kind: "project" },
    }),
    new Document({
      text: [
        "Personnes assignables dans ce projet :",
        ...users.map((user) => `- ${userLabel(user)} (identifiant exact : ${user.id})`),
      ].join("\n"),
      metadata: { kind: "members" },
    }),
  ];

  tasks.slice(0, 50).forEach((task) => {
    documents.push(new Document({
      text: [
        `Tâche existante : ${task.title}`,
        `Description : ${task.description || "Aucune"}`,
        `Statut : ${task.status}`,
        `Priorité : ${task.priority}`,
        `Échéance : ${task.dueDate || "Aucune"}`,
      ].join("\n"),
      metadata: { kind: "existing-task", taskId: task.id },
    }));
  });

  return documents;
}
