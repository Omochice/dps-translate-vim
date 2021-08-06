import { autocmd, Denops, ensureNumber, execute, popup } from "./deps.ts";

async function makeEmptyBuffer(denops: Denops): Promise<number> {
  if (denops.meta.host === "nvim") {
    const bufnr = await denops.call("nvim_create_buf", false, true);
    ensureNumber(bufnr);
    return bufnr;
  } else {
    const name = `${denops.name}://popup`;
    await execute(denops, `badd ${name}`);
    const bufnr = await denops.call("bufnr", `^${name}$`);
    ensureNumber(bufnr);
    await denops.call("setbufvar", bufnr, "&buftype", "nofile");
    return bufnr;
  }
}

function closeCmd(denops: Denops, winid: number): string {
  if (denops.meta.host === "nvim") {
    return `nvim_win_close(${winid}, v:false)`;
  } else {
    return `popup_close(${winid})`;
  }
}

export async function openPopup(
  denops: Denops,
  content: string | string[],
  autoclose = false,
  style?: popup.PopupWindowStyle,
): Promise<void> {
  // if inclode double width characters(ex. japanese),
  // string.length not work well
  let contentMaxWidth = content.length;
  if (Array.isArray(content)) {
    for (const line of content) {
      contentMaxWidth = Math.max(
        contentMaxWidth,
        await denops.call("strdisplaywidth", line) as number,
      );
    }
  }

  const winWidth = await denops.call("winwidth", ".");
  ensureNumber(winWidth);

  // on Vim, if popup protrude right, automove left
  const winRow = await denops.call("winline");
  const winCol = await denops.call("wincol");
  ensureNumber(winRow);
  ensureNumber(winCol);
  // +1 is right border
  const over = (winCol + contentMaxWidth + 1) - winWidth;
  const col = over > 0 ? winCol - over : winCol;

  if (style == undefined) {
    style = {
      relative: "win",
      row: denops.meta.host === "vim" ? "cursor" : winRow,
      col: denops.meta.host === "vim" ? "cursor" : col,
      width: contentMaxWidth,
      height: Array.isArray(content) ? content.length : 1,
      border: true,
    };
  }
  const popupBufnr = await makeEmptyBuffer(denops);
  ensureNumber(popupBufnr);

  const popupWinId = await popup.open(denops, popupBufnr, style);
  ensureNumber(popupWinId);

  await denops.call("setbufline", popupBufnr, 1, content);

  if (autoclose) {
    const row = await denops.call("line", ".");
    const vcol = await denops.call("virtcol", ".");
    ensureNumber(row);
    ensureNumber(vcol);
    const cmd = closeCmd(denops, popupWinId);
    await autocmd.group(denops, "dps_float_close", (helper) => {
      helper.remove(
        ["CursorMoved", "CursorMovedI", "VimResized"],
        "*",
      );
      helper.define(
        ["CursorMoved", "CursorMovedI", "VimResized"],
        "*",
        `if (line('.') != ${row} || virtcol('.') != ${vcol}) | call ${cmd} | augroup dps_float_close | autocmd! | augroup END | endif`,
      );
    });
  }

  return await Promise.resolve();
}
