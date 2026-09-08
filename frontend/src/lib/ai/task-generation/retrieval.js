import { getTopKEmbeddings } from "@llamaindex/core/embeddings";
import { Mistral } from "@mistralai/mistralai";
import { withMistralRetry } from "./provider-error";

export async function retrieveProjectContext(documents, prompt, apiKey) {
  const texts = documents.map((document) => document.getContent());
  const inputs = [...texts, prompt];
  const client = new Mistral({
    apiKey,
    timeoutMs: 45000,
  });

  const response = await withMistralRetry(() =>
    client.embeddings.create({
      model: "mistral-embed",
      inputs,
    })
  );

  const embeddings = [...response.data]
    .sort((first, second) => first.index - second.index)
    .map((item) => item.embedding);
  const queryEmbedding = embeddings.pop();

  if (!queryEmbedding || embeddings.length !== texts.length) {
    throw new Error("La réponse d’embeddings Mistral est incomplète.");
  }

  const [, documentIndexes] = getTopKEmbeddings(
    queryEmbedding,
    embeddings,
    Math.min(5, documents.length)
  );

  return documentIndexes
    .map((index) => texts[index])
    .filter(Boolean)
    .join("\n\n---\n\n");
}
