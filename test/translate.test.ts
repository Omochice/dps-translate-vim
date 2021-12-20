import { translate } from "../denops/translate/translate.ts";
import { assert, assertEquals, assertRejects } from "./dev_deps.ts";

const MOCK_404 = async (): Promise<Response> => {
  return await new Response(
    null,
    {
      status: 404,
      statusText: "404 test",
      headers: { "title": "test", "text": "test" },
    },
  );
};

const MOCK_200 = async (): Promise<Response> => {
  return await new Response(
    '{"code": 200, "text": "test"}',
    {
      status: 200,
      statusText: "200 test",
      headers: { "content-type": "application/json" },
    },
  );
};

const MOCK_INVALID_JSON = async (): Promise<Response> => {
  return await new Response(
    '{"this is invalid json formated text}',
    {
      status: 200,
      statusText: "200 test",
      headers: { "content-type": "application/json" },
    },
  );
};

Deno.test({
  name: "If returned status code is not 200, the function should throw error",
  fn: () => {
    self.fetch = MOCK_404;
    assertRejects(
      () => translate("test string", "EN", "JA"),
    );
  },
});

Deno.test({
  name:
    "If returned status code is 200, the function should return valid result.",
  fn: async () => {
    self.fetch = MOCK_200;
    const actual = await translate("test string", "EN", "JA");
    assert("code" in actual, "result should have 'code' property");
    assert("text" in actual, "result should have 'text' property");
    assertEquals(actual.code, 200, "result.code should be 200");
  },
});

Deno.test({
  name: "If josned body is invalid syntax, the function should throw error",
  fn: () => {
    self.fetch = MOCK_INVALID_JSON;
    assertRejects(
      () => translate("test string", "EN", "JA"),
    );
  },
});
