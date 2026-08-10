import { Mistral } from "@mistralai/mistralai";
import { generatedTaskListSchema } from "./schema";

const SYSTEM_PROMPT = `Tu aides à planifier un projet en français.
Génère uniquement des tâches concrètes, distinctes et directement utiles à la demande.
Chaque titre doit être bref et chaque description doit expliquer clairement le résultat attendu.
Les nouvelles tâches ont le statut TODO.
Choisis une priorité parmi LOW, MEDIUM, HIGH ou URGENT.
Utilise une date ISO YYYY-MM-DD seulement lorsqu'une échéance est déductible ; sinon utilise null.
N'utilise dans assigneeIds que les identifiants exacts présents dans le contexte.
N'invente jamais de personne. Si aucune assignation n'est évidente, utilise un tableau vide.
Évite les doublons avec les tâches existantes.`;

export async function requestStructuredTasks({
  apiKey,
  model,
  prompt,
  context,
  currentDate,
}) {
  const client = new Mistral({
    apiKey,
    timeoutMs: 45000,
  });

  const response = await client.chat.parse({
    model,
    temperature: 0.2,
    maxTokens: 2400,
    responseFormat: generatedTaskListSchema,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          `Date actuelle : ${currentDate}`,
          "Contexte récupéré dans le projet :",
          context,
          "Demande de l'utilisateur :",
          prompt,
          "Propose entre 1 et 10 tâches.",
        ].join("\n\n"),
      },
    ],
  });

  const parsed = response.choices?.[0]?.message?.parsed;
  return generatedTaskListSchema.parse(parsed);
}
