import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  geminiModelsToTry,
  isGeminiKeyError,
  isGeminiRetryableError,
  resolveGeminiApiKey,
} from './geminiEnv';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const RETRY_DELAYS_MS = [2_000, 8_000, 16_000];

export async function generateGeminiJson(
  prompt: string,
  temperature = 0.65,
): Promise<unknown> {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) throw new Error('NO_API_KEY');

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: unknown = new Error('Generation failed');

  for (const modelName of geminiModelsToTry()) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature,
      },
    });

    for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(text) as unknown;
      } catch (err) {
        lastError = err;
        if (isGeminiKeyError(err)) throw err;
        if (!isGeminiRetryableError(err)) throw err;
        await sleep(RETRY_DELAYS_MS[attempt]!);
      }
    }
  }

  throw lastError;
}
