import supertest from "supertest";
import app from "../src/app";
import { sequelize } from "../src/db";
import type { Person } from "../src/models";
import { createAllTables, dropAllTables, seedData } from "../src/seed";

const api = supertest(app);

beforeEach(async () => {
  await dropAllTables();
  await createAllTables();
  await seedData();
  await sequelize.query(
    "SELECT setval('people_id_seq', (SELECT MAX(id) FROM people))",
  );
});

test("a person can be created", async () => {
  const newPerson = {
    firstName: "Terppa",
    lastName: "Testaaja",
    freeText: "Tämä on testihenkilö",
    titleId: 1,
    departmentId: 1,
    researchGroupId: 1,
    supervisorIds: [1, 2],
  };

  const response = await api
    .post("/api/persons")
    .send(newPerson)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const createdPerson: Person = response.body;
  expect(createdPerson.firstName).toBe(newPerson.firstName);
  expect(createdPerson.lastName).toBe(newPerson.lastName);
  expect(createdPerson.freeText).toBe(newPerson.freeText);
  expect(createdPerson.titleId).toBe(newPerson.titleId);
  expect(createdPerson.departmentId).toBe(newPerson.departmentId);
  expect(createdPerson.researchGroupId).toBe(newPerson.researchGroupId);
  expect(createdPerson.supervisors).toHaveLength(
    newPerson.supervisorIds.length,
  );
  console.log("Created person:", createdPerson);
});

test("a person with missing required fields cannot be created", async () => {
  const newPerson = {
    lastName: "Testaaja",
    freeText: "Tämä on testihenkilö",
    titleId: 1,
    departmentId: 1,
    researchGroupId: 1,
    supervisorIds: [1, 2],
  };

  await api.post("/api/persons").send(newPerson).expect(400);
});
