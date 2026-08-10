import { z } from "zod";

export const taskStatuses = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"];
export const taskPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const generatedTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000),
  status: z.enum(taskStatuses),
  priority: z.enum(taskPriorities),
  dueDate: z.string().nullable(),
  assigneeIds: z.array(z.string()),
});

export const generatedTaskListSchema = z.object({
  tasks: z.array(generatedTaskSchema).min(1).max(10),
});

export const promptSchema = z
  .string()
  .trim()
  .min(10, "Décrivez votre besoin en au moins 10 caractères.")
  .max(2000, "Votre demande ne peut pas dépasser 2 000 caractères.");
