import supertest from "supertest";
import app from "../src/app";

const api = supertest(app);

test("ping test", async () => {
  const response = await api.get("/ping");
  expect(response.text).toEqual("pong");
});
