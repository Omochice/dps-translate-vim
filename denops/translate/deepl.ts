import type { Translator } from "./translator.ts";
import { ensure, is } from "./deps.ts";

interface DeeplResponce {
  translations: TranslationResponce[];
}

interface TranslationResponce {
  detected_source_language: string;
  text: string;
}

export const KnownErrors: Record<number, string> = {
  400: "Bad request. Please check error message and your parameters.",
  403: "Authorization failed. Please supply a valid auth_key parameter.",
  404: "The requested resource could not be found.",
  413: "The request size exceeds the limit.",
  414:
    "The request URL is too long. You can avoid this error by using a POST request instead of a GET request, and sending the parameters in the HTTP body.",
  429: "Too many requests. Please wait and resend your request.",
  456: "Quota exceeded. The character limit has been reached.",
  503: "Resource currently unavailable. Try again later.",
  529: "Too many requests. Please wait and resend your request.",
}; // this from https://www.deepl.com/docs-api/accessing-the-api/error-handling/

export async function translate(
  text: string[],
  sourceLanguage: string,
  targetLanguage: string,
  option: unknown = { authKey: "" },
): Promise<DeeplResponce> {
  const opt = ensure(
    option,
    is.ObjectOf({
      authKey: is.String,
      isPro: is.OptionalOf(is.Boolean),
    }),
  );
  const endpoint = opt.isPro
    ? "https://api.deepl.com/v2/translate"
    : "https://api-free.deepl.com/v2/translate";
  const body = new URLSearchParams({
    auth_key: opt.authKey,
    source_lang: sourceLanguage,
    target_lang: targetLanguage,
    text: text.join("\n"),
  });

  const res = await fetch(endpoint, {
    method: "POST",
    body: body,
  });

  if (res.status in KnownErrors) {
    throw new Error(`[${res.status}]${KnownErrors[res.status]}`);
  }

  const response: DeeplResponce = await res.json();
  return response;
}

export function extractTranslatedText(response: unknown): string {
  return ensure(
    response,
    is.ObjectOf({
      translations: is.ArrayOf(is.ObjectOf({
        text: is.String,
      })),
    }),
  ).translations
    .map(({ text }) => text).join("");
}

export const deepl: Translator = {
  translate,
  extractTranslatedText,
};
