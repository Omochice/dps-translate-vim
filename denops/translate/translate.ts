const endpoint =
  "https://script.google.com/macros/s/AKfycbzdOBxUB9-PeT86IhOJO7oTbjEjJAf8ECUfrqW06eKLQTy8xdaLtUBmexx94Jl3cLNb/exec";

interface translateResult {
  code: number;
  text: string;
}

export async function translate(
  rowStr: string | string[],
  sourceLanguage: string,
  targetLanguage: string,
): Promise<translateResult> {
  const text = typeof rowStr === "string" ? rowStr : rowStr.join("\n");

  const url = endpoint + "?" + new URLSearchParams({
    text: text,
    source: sourceLanguage,
    target: targetLanguage,
  });

  const res = await fetch(url);
  if (res.status != 200) {
    throw new Error(`Invalid status [${res.status}]`);
  } else {
    try {
      return await res.json();
    } catch (e) {
      // json decode error
      throw e
    }
  }
}
