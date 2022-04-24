import {
  Denops,
  ensureArray,
  ensureNumber,
  fn,
  isNumber,
  openPopup,
  vars,
} from "./deps.ts";

type BorderStyle = {
  topLeft: string;
  top: string;
  topRight: string;
  right: string;
  bottomRight: string;
  bottom: string;
  bottomLeft: string;
  left: string;
};
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

type Option = {
  split: "floating" | "top" | "bottom" | "left" | "right";
  bufname: string;
  width?: number;
  autoclose?: boolean;
  border?: BorderStyle | "none";
};

export async function open(
  denops: Denops,
  contents: string[],
  option: Option = { split: "floating", bufname: "NO NAME" },
): Promise<void> {
  // prepare buffer
  const bufnr = await fn.bufnr(denops, option.bufname, true);
  await fn.bufload(denops, bufnr);
  await fn.setbufvar(denops, bufnr, "&modifiable", 1);
  await fn.deletebufline(denops, bufnr, 1, "$");
  // if use floating window, split contents per winwidth
  if (option.split == "floating") {
    const floatingWidth = option.width ?? await fn.winwidth(denops, ".");
    const constracted: string[] = [];
    for (const x of contents) {
      for (const splitted of await constract(denops, x, floatingWidth)) {
        constracted.push(splitted);
      }
    } // FIXME sentences.map() not work well
    const contentWidth = await (async () => {
      if (contents.length != constracted.length) {
        return floatingWidth;
      } else {
        const widths = [];
        for (const line of constracted) {
          widths.push(await fn.strdisplaywidth(denops, line));
        }
        return Math.max(...ensureArray(widths, isNumber));
      }
    })(); // TODO: refactor
    await fn.setbufline(denops, bufnr, 1, constracted);
    openPopup({
      denops: denops,
      bufnr: bufnr,
      position: "cursor",
      size: { width: contentWidth, height: constracted.length },
      autoclose: option.autoclose,
      border: option.border,
    });
  } else {
    await fn.setbufline(denops, bufnr, 1, contents);
    const commands = {
      "top": `leftabove sbuffer ${bufnr}`,
      "bottom": `rightbelow sbuffer ${bufnr}`,
      "left": `leftabove vertical sbuffer ${bufnr}`,
      "right": `rightbelow vertical sbuffer ${bufnr}`,
    };
    if (await fn.bufwinnr(denops, option.bufname) == -1) {
      await denops.cmd(commands[option.split]);
    }
  }
  await Promise.all([
    fn.setbufvar(denops, bufnr, "&modifiable", 0),
    fn.setbufvar(denops, bufnr, "&buftype", "nofile"),
    fn.setbufvar(denops, bufnr, "&filetype", "dps-translate"),
  ]);
}
