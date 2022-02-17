import * as deepl from "../denops/translate/deepl.ts";
import { assert, assertEquals, assertRejects } from "././dev_deps.ts";

Deno.test({
  name: "If returned status is not 200, the function should reject",
  fn: async (t) => {
    for (const statuscode in deepl.KnownErrors) {
      await t.step(`if status is ${statuscode}`, () => {
        self.fetch = async () => {
          return await Promise.resolve(
            new Response(
              `{"code": ${statuscode}, "text": "test"}`,
              {
                status: parseInt(statuscode),
                statusText: `${statuscode} test`,
                headers: { "content-type": "application/json" },
              },
            ),
          );
        };
        assertRejects(() => deepl.translate(["test string"], "en", "ja"));
      });
    }
  },
});

const acceptSample = {
  translations: [
    { detected_source_language: "en", text: "sample text" },
    { detected_source_language: "en", text: "sample text 2" },
  ],
};

const MOCK_200 = async () => {
  return await Promise.resolve(
    new Response(
      JSON.stringify(acceptSample),
      {
        status: 200,
        statusText: "200 test",
        headers: { "content-type": "application/json" },
      },
    ),
  );
};

Deno.test({
  name: "If returned status is 200, the function should accept",
  fn: async (t) => {
    self.fetch = MOCK_200;
    const actual = await deepl.translate(["test string"], "en", "ja");
    await t.step("Response has 'translations'?", () => {
      assert("translations" in actual);
    });
    await t.step("Each translateds has expected fields?", () => {
      for (const translated of actual.translations) {
        for (const field of ["detected_source_language", "text"]) {
          assert(field in translated, `Result should hace "${field}"`);
        }
      }
    });
  },
});

Deno.test({
  name: "`extractTranslatedText` should return concated text",
  fn: async () => {
    self.fetch = MOCK_200;
    const expected = acceptSample.translations.map((x) => x.text).join("");
    const res = deepl.translate(["test string"], "en", "ja");
    const actual = deepl.extractTranslatedText(await res);
    assertEquals(actual, expected);
  },
});
