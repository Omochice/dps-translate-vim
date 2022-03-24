import {
  Denops,
  ensureNumber,
  ensureString,
  fn,
  openPopup,
  vars,
} from "./deps.ts";

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
async function constract(
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

export async function open(
  denops: Denops,
  split: "floating" | "top" | "bottom" | "left" | "right",
  contents: string[],
  option? = { autoclose: true },
): Promise<void> {
  // prepare buffer
  const bufnr = await fn.bufnr(denops, "dps-translate", true);
  await fn.bufload(denops, bufnr);
  await fn.setbufvar(denops, bufnr, "&modifiable", 1);
  await fn.deletebufline(denops, bufnr, 1, "$");
  // if use floating window, split contents per winwidth
  if (split == "floating") {
    const winWidth = fn.winwidth(denops, ".");
    const floatingWidthRate: Promise<number> = vars.g.get(
      denops,
      "dps_translate_floating_rate",
      0.8,
    );
    const floatingWidth = Math.floor(
      ensureNumber(await winWidth) * await floatingWidthRate,
    );
    const constracted: string[] = [];
    for (const x of contents) {
      for (const splitted of await constract(denops, x, floatingWidth)) {
        constracted.push(splitted);
      }
    } // FIXME sentences.map() not work well
    await fn.setbufline(denops, bufnr, 1, constracted);
    openPopup(denops, constracted, option); // TODO: use filled buffer
  } else {
    await fn.setbufline(denops, bufnr, 1, contents);
    const commands = {
      "top": `leftabove sbuffer ${bufnr}`,
      "bottom": `rightbelow sbuffer ${bufnr}`,
      "left": `leftabove vertical sbuffer ${bufnr}`,
      "right": `rightbelow vertical sbuffer ${bufnr}`,
    };
    await denops.cmd(commands[split]);
  }
  await Promise.all([
    fn.setbufvar(denops, bufnr, "&modifiable", 0),
    fn.setbufvar(denops, bufnr, "&buftype", "nofile"),
    fn.setbufvar(denops, bufnr, "&filetype", "dps-translate"),
  ]);
}
