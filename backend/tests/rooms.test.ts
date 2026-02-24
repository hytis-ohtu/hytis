import supertest from "supertest";
import app from "../src/app";
import { rooms } from "../src/data/rooms";

const api = supertest(app);

test("rooms data is returned as json", async () => {
  await api
    .get("/api/rooms")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all rooms are returned", async () => {
  const response = await api.get("/api/rooms").expect(200);
  expect(response.body).toHaveLength(rooms.length);
});
