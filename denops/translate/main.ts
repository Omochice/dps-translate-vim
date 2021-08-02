import {
  Denops,
  ensureArray,
  ensureString,
  execute,
  isString,
  vars,
} from "./deps.ts";
import { translate } from "./translate.ts";
import { openPopup } from "./popup.ts";

export async function main(denops: Denops) {
  denops.dispatcher = {
    async dpsTranslate(
      bang: unknown,
      line1: unknown,
      line2: unknown,
      arg: unknown,
    ): Promise<void> {
      // Language identification
      const sourceLanguage = await vars.g.get(
        denops,
        "dps_translate_source",
        "en",
      );
      const targetLanguage = await vars.g.get(
        denops,
        "dps_translate_target",
        "ja",
      );
      ensureString(sourceLanguage);
      ensureString(targetLanguage);

      // Specifying the target text
      let targetText;
      if (arg === undefined) {
        targetText = await denops.call("getline", line1, line2);
        ensureArray(targetText, isString);
      } else {
        targetText = arg;
        ensureString(targetText);
        console.log("args using");
      }

      // Translation
      let translateResult;
      if (bang === "!") {
        translateResult = await translate(
          targetText,
          targetLanguage,
          sourceLanguage,
        );
      } else {
        translateResult = await translate(
          targetText,
          sourceLanguage,
          targetLanguage,
        );
      }

      // Error handling and showing
      if (translateResult.code != 200) {
        console.error(
          `[dps-translate] ERROR status code is ${translateResult.code}`,
        );
      } else {
        openPopup(denops, translateResult.text.split("\n"), true);
      }
    },
  };
  await execute(
    denops,
    `
    command! -bang -range -nargs=? Translate call denops#notify("${denops.name}", "dpsTranslate", ["<bang>", <line1>, <line2>, <f-args>])
    `,
  );
}
