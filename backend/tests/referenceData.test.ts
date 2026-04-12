import supertest from "supertest";
import app from "../src/app";
import { disconnectDatabase } from "../src/db";
import {
  connectToDatabase,
  createAllTables,
  dropAllTables,
  seedData,
} from "../src/seed";

const api = supertest(app);

describe("/api/reference-data", () => {
  beforeEach(async () => {
    await connectToDatabase();
    await dropAllTables();
    await createAllTables();
    await seedData();
  });

  it("departments data is returned as json", async () => {
    await api
      .get("/api/reference-data/departments")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  it("error handling works for departments endpoint", async () => {
    await dropAllTables();
    await api
      .get("/api/reference-data/departments")
      .expect(500)
      .expect("Content-Type", /application\/json/);
  });

  it("titles data is returned as json", async () => {
    await api
      .get("/api/reference-data/titles")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  it("error handling works for titles endpoint", async () => {
    await dropAllTables();
    await api
      .get("/api/reference-data/titles")
      .expect(500)
      .expect("Content-Type", /application\/json/);
  });

  it("research groups data is returned as json", async () => {
    await api
      .get("/api/reference-data/research-groups")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  it("error handling works for research groups endpoint", async () => {
    await dropAllTables();
    await api
      .get("/api/reference-data/research-groups")
      .expect(500)
      .expect("Content-Type", /application\/json/);
  });

  afterAll(async () => {
    await disconnectDatabase();
  });
});
