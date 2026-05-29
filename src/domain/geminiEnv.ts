export function resolveGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || /^your_api_key_here$/i.test(key)) return null;
  return key;
}

function geminiErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export function isGeminiKeyError(err: unknown): boolean {
  const msg = geminiErrorMessage(err);
  return (
    msg.includes('API key not valid') ||
    msg.includes('API_KEY_INVALID') ||
    msg.includes('API key expired')
  );
}

export function isGeminiQuotaError(err: unknown): boolean {
  const msg = geminiErrorMessage(err);
  return (
    msg.includes('[429]') ||
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('Quota exceeded') ||
    msg.includes('RESOURCE_EXHAUSTED')
  );
}

/** Model capacity / temporary Google-side unavailability. */
export function isGeminiOverloadError(err: unknown): boolean {
  const msg = geminiErrorMessage(err);
  return (
    msg.includes('[503]') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('temporarily unavailable')
  );
}

export function isGeminiRetryableError(err: unknown): boolean {
  return isGeminiQuotaError(err) || isGeminiOverloadError(err);
}

/** Default model — override in .env.local */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export const GEMINI_MODEL_FALLBACKS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
] as const;

export function resolveGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

/** Preferred model first, then fallbacks (no duplicates). */
export function geminiModelsToTry(): string[] {
  const preferred = resolveGeminiModel();
  const ordered = [preferred, ...GEMINI_MODEL_FALLBACKS];
  return [...new Set(ordered)];
}

export function geminiErrorCode(err: unknown): string {
  if (err instanceof Error && err.message === 'NO_API_KEY') {
    return 'GEMINI_API_KEY_INVALID';
  }
  if (isGeminiKeyError(err)) return 'GEMINI_API_KEY_INVALID';
  if (isGeminiQuotaError(err)) return 'GEMINI_QUOTA_EXCEEDED';
  if (isGeminiOverloadError(err)) return 'GEMINI_OVERLOADED';
  return 'GENERATION_FAILED';
}
