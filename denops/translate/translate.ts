interface TranslateResult {
  code: number;
  text: string;
}

export async function translate(
  text: string[],
  sourceLanguage: string,
  targetLanguage: string,
  _option?: null,
): Promise<TranslateResult> {
  const endpoint =
    "https://script.google.com/macros/s/AKfycbzdOBxUB9-PeT86IhOJO7oTbjEjJAf8ECUfrqW06eKLQTy8xdaLtUBmexx94Jl3cLNb/exec";
  const body = new URLSearchParams({
    text: text.join("\n"),
    source: sourceLanguage,
    target: targetLanguage,
  });

  const res = await fetch(endpoint + "?" + body, {
    method: "GET",
  }); // `fetch` with GET method cannot handle `body` parameter

  if (res.status != 200) {
    throw new Error(`Invalid status [${res.status}]`);
  } else {
    try {
      const json: TranslateResult = await res.json();
      if (json.code != 200) {
        throw new Error(`Invalid status [${json.code}]`);
      }
      return json;
    } catch (e) {
      // json decode error or not 200
      throw e;
    }
  }
}

export function extractTranslatedText(response: TranslateResult): string {
  return response.text;
}
