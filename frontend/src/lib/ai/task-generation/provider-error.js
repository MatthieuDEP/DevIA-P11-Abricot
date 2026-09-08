const QUOTA_MARKERS = [
  "insufficient_quota",
  "quota exhausted",
  "monthly quota",
  "monthly limit",
  "monthly token",
  "tokens per month",
  "monthly usage limit",
  "monthly usage cap",
  "credit balance",
  "credits exhausted",
  "credit exhausted",
  "insufficient credit",
  "insufficient funds",
  "balance depleted",
  "billing limit",
  "spending limit",
  "payment required",
];

function searchableText(value) {
  if (!value) return "";
  if (typeof value === "string") return value.toLocaleLowerCase("en");

  try {
    return JSON.stringify(value).toLocaleLowerCase("en");
  } catch {
    return "";
  }
}

function errorDetails(error) {
  return [
    error?.body,
    error?.message,
    error?.data,
    error?.data$,
    error?.response?.data,
  ]
    .map(searchableText)
    .filter(Boolean)
    .join(" ");
}

function headerEntries(headers) {
  if (!headers) return [];
  return typeof headers.entries === "function"
    ? [...headers.entries()]
    : Object.entries(headers);
}

function headerValue(headers, expectedName) {
  const normalizedExpectedName = expectedName.toLocaleLowerCase("en");
  const entry = headerEntries(headers).find(
    ([name]) => String(name).toLocaleLowerCase("en") === normalizedExpectedName
  );
  return entry ? String(entry[1]) : null;
}

function monthlyLimitReached(headers) {
  return headerEntries(headers).some(([name, value]) => {
    const normalizedName = String(name).toLocaleLowerCase("en");
    const normalizedValue = String(value).trim();

    return (
      normalizedName.includes("ratelimit") &&
      (normalizedName.includes("month") || normalizedName.includes("monthly")) &&
      normalizedName.includes("remaining") &&
      Number(normalizedValue) <= 0
    );
  });
}

function retryAfterMilliseconds(headers) {
  const value = headerValue(headers, "retry-after");
  if (!value) return null;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const retryDate = Date.parse(value);
  if (Number.isNaN(retryDate)) return null;
  return Math.max(0, retryDate - Date.now());
}

function retryDelay(error, retryIndex) {
  const providerDelay = retryAfterMilliseconds(error?.headers);
  const exponentialDelay = 1000 * (2 ** retryIndex);
  return Math.min(providerDelay ?? exponentialDelay, 30000);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function mistralProviderFailure(error) {
  const status =
    error?.statusCode ||
    error?.status ||
    error?.response?.status ||
    error?.rawResponse?.status;

  if (status === 401 || status === 403) {
    return {
      code: "INVALID_API_KEY",
      message: "La configuration Mistral est invalide. Vérifiez la clé API.",
    };
  }

  if (status === 402) {
    return {
      code: "INSUFFICIENT_CREDITS",
      message:
        "Les crédits Mistral sont épuisés ou la facturation n’est pas active. Vérifiez le solde et le moyen de paiement dans la console Mistral.",
    };
  }

  if (status === 429) {
    const details = errorDetails(error);
    const quotaExhausted =
      monthlyLimitReached(error?.headers) ||
      QUOTA_MARKERS.some((marker) => details.includes(marker));

    if (quotaExhausted) {
      return {
        code: "QUOTA_EXHAUSTED",
        message:
          "Le quota mensuel Mistral est épuisé. Vérifiez les limites d’utilisation ou attendez leur renouvellement.",
      };
    }

    return {
      code: "RATE_LIMIT",
      message:
        "Trop de requêtes ont été envoyées à Mistral. Patientez quelques instants, puis réessayez.",
    };
  }

  if (error?.name === "RequestTimeoutError" || error?.name === "AbortError") {
    return {
      code: "TIMEOUT",
      message:
        "La génération prend trop de temps. Réessayez avec une demande plus courte.",
    };
  }

  return {
    code: "PROVIDER_UNAVAILABLE",
    message:
      "Le service de génération est momentanément indisponible. Réessayez plus tard.",
  };
}

export async function withMistralRetry(
  operation,
  { maxAttempts = 4, wait = sleep } = {}
) {
  const allowedAttempts = Math.max(1, maxAttempts);

  for (let attempt = 0; attempt < allowedAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const failure = mistralProviderFailure(error);
      const canRetry =
        failure.code === "RATE_LIMIT" && attempt < allowedAttempts - 1;

      if (!canRetry) throw error;
      await wait(retryDelay(error, attempt));
    }
  }

  throw new Error("La nouvelle tentative Mistral a échoué.");
}
