import {
  assertString,
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
import { open } from "./open.ts";
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
      // Get text
      // const text: string[] = [];
      // if (typeof arg === "undefined") {
      //   const lines = await fn.getline(denops, line1, line2);
      //   text.push(...(joinWithSpace ? [lines.join(" ")] : text));
      // } else {
      //   text.push(ensureString(arg));
      // }
      // console.log(line1, line2)
      const text: string[] = [
        arg ?? (
          line1 == line2
            ? await fn.getline(denops, line1)
            : ((await fn.getline(denops, line1, line2)).join(" "))
        ),
      ];

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
      const [source, target] = await Promise.all([
        sourceLanguage,
        targetLanguage,
      ]).then(([s, t]) => {
        return bang == "!" ? [t, s] : [s, t];
      });

      // Translation
      const engines = {
        google: google,
        deepl: deepl,
      }; // name: funcRef
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

      // Decompose
      const segmenter = new Intl.Segmenter(target, { granularity: "sentence" });
      const sentences: string[] = [];
      for (const s of segmenter.segment(translated)) {
        sentences.push(s.segment);
      }

      // open buffer
      const winWidth = Math.floor(
        ensureNumber(await fn.winwidth(denops, ".")) * 0.8,
      );

      open(denops, sentences, {
        split: await vars.g.get(denops, "dps_translate_split", "floating"),
        bufname: "dps-translate.output",
        width: winWidth,
        autoclose: true,
      });
    },
  };
}
