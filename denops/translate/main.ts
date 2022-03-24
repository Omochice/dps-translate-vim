import {
  Denops,
  ensureArray,
  ensureNumber,
  ensureString,
  execute,
  fn,
  isString,
  openPopup,
  vars,
} from "./deps.ts";
import { extractTranslatedText, translate } from "./translate.ts";
import { constract } from "./constract.ts";

export function main(denops: Denops): void {
  denops.dispatcher = {
    async dpsTranslate(
      bang: unknown,
      line1: number,
      line2: number,
      joinWithSpace: unknown,
      arg: unknown,
    ): Promise<void> {
      // Language identification
      const sourceLanguage: Promise<string> = vars.g.get(
        denops,
        "dps_translate_source",
        "en",
      );
      const targetLanguage: Promise<string> = vars.g.get(
        denops,
        "dps_translate_target",
        "ja",
      );

      let text: string[];
      if (typeof arg === "undefined") {
        text = await fn.getline(denops, line1, line2);
        text = joinWithSpace ? [text.join(" ")] : text;
      } else {
        ensureString(arg);
        text = [arg];
      }

      const [source, target] = await Promise.all([
        sourceLanguage,
        targetLanguage,
      ]).then(([s, t]) => {
        return bang == "!" ? [t, s] : [s, t];
      });

      let translated: string;
      try {
        const res = await translate(text, source, target);
        translated = extractTranslatedText(res);
      } catch (e) {
        console.error(`[dps-translate] ${e}`);
        return;
      }

      const segmenter = new Intl.Segmenter(target, { granularity: "sentence" });
      const sentences = Array.from(segmenter.segment(translated)).map((s) =>
        s.segment
      );
      const winWidth = Math.floor(await fn.winwidth(denops, ".") * 0.8);
      const constracted: string[] = [];
      for (const x of sentences) {
        for (const splitted of await constract(denops, x, winWidth)) {
          constracted.push(splitted);
        }
      } // FIXME sentences.map() not work well

      // open buffer
      openPopup(denops, constracted, { autoclose: true });
    },
  };
}
