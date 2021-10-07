import {
  Denops,
  ensureArray,
  ensureNumber,
  ensureString,
  execute,
  isString,
  openPopup,
  vars,
} from "./deps.ts";
import { translate } from "./translate.ts";

export async function main(denops: Denops) {
  denops.dispatcher = {
    async dpsTranslate(
      bang: unknown,
      line1: unknown,
      line2: unknown,
      joinWithSpace: unknown,
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
      ensureNumber(line1);
      ensureNumber(line2);

      // Specifying the target text
      let targetText;
      if (arg == undefined && joinWithSpace) {
        targetText = (await denops.call("getline", line1, line2) as string[])
          .join(" ");
      } else if (arg == undefined) {
        targetText = await denops.call("getline", line1, line2);
        ensureArray(targetText, isString);
      } else {
        targetText = arg;
        ensureString(targetText);
      }

      // Translation
      let translateResult;
      try {
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
      } catch (e) {
        // other than 200
        console.error(
          `[dps-translate] ${e}`,
        );
        return await Promise.resolve();
      }

      if (joinWithSpace) {
        const len = Math.floor(
          translateResult.text.length / (line2 - line1 + 1),
        );
        const regex = new RegExp(".{1," + `${len}` + "}", "g");
        const splited = translateResult.text.match(regex);
        if (splited == null) {
          console.error(
            `[dps-translate] ERROR invalid result of translation. ${
              JSON.stringify(translateResult)
            }`,
          );
        } else {
          openPopup(denops, splited, { autoclose: true });
        }
      } else {
        openPopup(denops, translateResult.text.split("\n"), {
          autoclose: true,
        });
      }
    },
  };
  await execute(
    denops,
    `
    command! -bang -range -nargs=? Translate call denops#notify("${denops.name}", "dpsTranslate", ["<bang>", <line1>, <line2>, v:false, <f-args>])
    command! -bang -range -nargs=? TranslateJoin call denops#notify("${denops.name}", "dpsTranslate", ["<bang>", <line1>, <line2>, v:true, <f-args>])
    `,
  );
}
