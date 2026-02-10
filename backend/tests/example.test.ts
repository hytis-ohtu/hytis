import assert from "node:assert";
import { test } from "node:test";
import supertest from "supertest";

import app from "../src/app";

const api = supertest(app);

test("ping test", async () => {
  const response = await api.get("/ping");
  assert.strictEqual(response.text.includes("pong"), true);
});
