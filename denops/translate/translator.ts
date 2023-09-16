export type Translator = {
  extractTranslatedText: (translateResult: unknown) => string;
  translate: (
    text: string[],
    sourceLanguage: string,
    targetLanguage: string,
    option?: unknown,
  ) => Promise<unknown>;
};
