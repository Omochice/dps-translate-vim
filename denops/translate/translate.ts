const endpoint =
  "https://script.google.com/macros/s/AKfycbzdOBxUB9-PeT86IhOJO7oTbjEjJAf8ECUfrqW06eKLQTy8xdaLtUBmexx94Jl3cLNb/exec";

interface translateResult {
  status: number;
  text: string;
}

export async function translate(
  rowStr: string | string[],
  sourceLanguage: string,
  targetLanguage: string,
): Promise<translateResult> {
  const url = endpoint + "?" + new URLSearchParams({
    text: Array.isArray(rowStr) ? rowStr.join("\n") : rowStr,
    source: sourceLanguage,
    target: targetLanguage,
  });

  const res = await fetch(url);
  if (res.status != 200) {
    return { status: res.status, text: "" };
  } else {
    return await res.json();
  }
}
