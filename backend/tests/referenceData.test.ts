import supertest from "supertest";
import app from "../src/app";
import {
  createAllTables,
  dropAllTables,
  fixSequences,
  seedData,
} from "../src/seed";

const api = supertest(app);

beforeEach(async () => {
  await dropAllTables();
  await createAllTables();
  await seedData();
  await fixSequences();
});

test("departments data is returned as json", async () => {
  await api
    .get("/api/reference-data/departments")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("error handling works for departments endpoint", async () => {
  await dropAllTables();
  await api
    .get("/api/reference-data/departments")
    .expect(500)
    .expect("Content-Type", /application\/json/);
});

test("titles data is returned as json", async () => {
  await api
    .get("/api/reference-data/titles")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("error handling works for titles endpoint", async () => {
  await dropAllTables();
  await api
    .get("/api/reference-data/titles")
    .expect(500)
    .expect("Content-Type", /application\/json/);
});

test("research groups data is returned as json", async () => {
  await api
    .get("/api/reference-data/research-groups")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("error handling works for research groups endpoint", async () => {
  await dropAllTables();
  await api
    .get("/api/reference-data/research-groups")
    .expect(500)
    .expect("Content-Type", /application\/json/);
});
