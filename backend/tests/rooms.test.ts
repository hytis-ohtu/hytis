import supertest from "supertest";
import app from "../src/app";

const api = supertest(app);

test("rooms data is returned as json", async () => {
  await api
    .get("/api/rooms")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});
