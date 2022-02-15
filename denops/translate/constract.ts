import { Denops, fn } from "./deps.ts";
async function slicing(
  denops: Denops,
  text: string,
  maxWidth: number,
  numerator = 1,
  denominator = 2,
): Promise<number> {
  const mid = Math.floor(text.length * numerator / denominator);
  if (await fn.strwidth(denops, text.slice(0, mid)) < maxWidth) {
    if (await fn.strwidth(denops, text.slice(0, mid + 1)) >= maxWidth) {
      return mid;
    } else {
      return slicing(
        denops,
        text,
        maxWidth,
        numerator * 2 + 1,
        denominator * 2,
      );
    }
  } else {
    return slicing(denops, text, maxWidth, numerator * 2 - 1, denominator * 2);
  }
}
export async function constract(
  denops: Denops,
  text: string,
  maxWidth: number,
): Promise<string[]> {
  const results: string[] = [];
  while (text != "") {
    if (await fn.strwidth(denops, text) < maxWidth) {
      results.push(text);
      break;
    } else {
      const end = await slicing(denops, text, maxWidth);
      results.push(text.slice(0, end));
      text = text.slice(end);
    }
  }
  return results;
}
