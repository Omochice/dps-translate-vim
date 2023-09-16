import { assert, Denops, ensure, fn, is, vars } from "./deps.ts";
import type { Translator } from "./translator.ts";
import { open } from "./open.ts";
import { deepl } from "./deepl.ts";
import { google } from "./translate.ts";

export function main(denops: Denops): void {
  denops.dispatcher = {
    async dpsTranslate(
      args: unknown,
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
      const [bang, line1, line2, joinWithSpace, arg] = ensure(
        args,
        is.Array,
      );
      const text = await (async () => {
        if (is.String(arg)) {
          return arg;
        }
        if (line1 === line2) {
          return await fn.getline(denops, ensure(line1, is.Number));
        }
        return (await fn.getline(
          denops,
          ensure(line1, is.Number),
          ensure(line2, is.Number),
        )).join(
          joinWithSpace ? " " : "",
        );
      })();

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
      const engines = new Map<string, Translator>([
        ["google", google],
        ["deppl", deepl],
      ]);
      const engine = await vars.g.get(denops, "dps_translate_engine", "google");
      assert(engine, is.String);
      const choised = engines.get(engine);
      if (choised === undefined) {
        console.error(`[dps-translate] ${engine} is not provided`);
        return;
      }

      let translated: string;
      try {
        const token = vars.g.get(denops, `dps_translate_${engine}_token`, "");
        const isPro = vars.g.get(
          denops,
          `dps_translate_${engine}_is_pro`,
          false,
        );
        const res = await choised.translate([text], source, target, {
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
        ensure(await fn.winwidth(denops, "."), is.Number) * 0.8,
      );

      open(denops, sentences, {
        split: await vars.g.get(denops, "dps_translate_split", "floating"),
        bufname: "dps-translate.output",
        width: winWidth,
        autoclose: true,
        border: await vars.g.get(denops, "dps_translate_border", "none"),
      });
    },
  };
}
