import {
  Denops,
  assertArray,
  assertNumber,
  assertString,
  execute,
  fn,
  isString,
  openPopup,
  vars,
} from "./deps.ts";
import { constract } from "./constract.ts";
import * as deepl from "./deepl.ts";
import * as google from "./translate.ts";

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
        assertString(arg);
        text = [arg];
      }

      const [source, target] = await Promise.all([
        sourceLanguage,
        targetLanguage,
      ]).then(([s, t]) => {
        return bang == "!" ? [t, s] : [s, t];
      });

      const engines = {
        google: google,
        deepl: deepl,
      };
      const engine = await vars.g.get(denops, "dps_translate_engine", "google");
      assertString(engine);
      if (!engine in engines) {
        console.error(`[dps-translate] ${engine} is not provided`);
        return;
      }
      const choised = engines[engine];

      let translated: string;
      try {
        const token = vars.g.get(denops, `dps_translate_${engine}_token`, "");
        const isPro = vars.g.get(
          denops,
          `dps_translate_${engine}_is_pro`,
          false,
        );
        const res = await choised.translate(text, source, target, {
          authKey: await token,
          isPro: await isPro,
        });
        translated = choised.extractTranslatedText(res);
      } catch (e) {
        console.error(`[dps-translate] ${e}`);
        return;
      }

      const segmenter = new Intl.Segmenter(target, { granularity: "sentence" });
      const sentences = segmenter.segment(translated);
      const winWidth = Math.floor(await fn.winwidth(denops, ".") * 0.8);
      assertNumber(winWidth);
      const constracted: string[] = [];
      for (const x of sentences) {
        for (const splitted of await constract(denops, x.segment, winWidth)) {
          constracted.push(splitted);
        }
      } // FIXME sentences.map() not work well

      // open buffer
      openPopup(denops, constracted, { autoclose: true });
    },
  };
}
