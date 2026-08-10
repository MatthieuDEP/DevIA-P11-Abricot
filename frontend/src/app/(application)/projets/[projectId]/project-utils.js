export const statusLabels = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

export const statusClasses = {
  TODO: "todo",
  IN_PROGRESS: "inProgress",
  DONE: "done",
  CANCELLED: "cancelled",
};

export const priorityLabels = {
  URGENT: "Urgente",
  HIGH: "Haute",
  MEDIUM: "Moyenne",
  LOW: "Basse",
};

export function initials(user) {
  return (user?.name || user?.email || "?")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function formatDate(date) {
  if (!date) return "Sans échéance";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function dateInputValue(date) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}
