import { getTopKEmbeddings } from "@llamaindex/core/embeddings";
import { MistralAIEmbedding } from "@llamaindex/mistral";

export async function retrieveProjectContext(documents, prompt, apiKey) {
  const embedModel = new MistralAIEmbedding({ apiKey });
  const texts = documents.map((document) => document.getContent());
  const [documentEmbeddings, queryEmbedding] = await Promise.all([
    embedModel.getTextEmbeddingsBatch(texts),
    embedModel.getTextEmbedding(prompt),
  ]);
  const [, documentIndexes] = getTopKEmbeddings(
    queryEmbedding,
    documentEmbeddings,
    Math.min(5, documents.length)
  );

  return documentIndexes
    .map((index) => texts[index])
    .filter(Boolean)
    .join("\n\n---\n\n");
}
