import supertest from "supertest";
import app from "../src/app";
import type { Person } from "../src/models";
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
    .post("/api/people")
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

  await api.post("/api/people").send(newPerson).expect(400);
});

test("a person with invalid supervisor IDs cannot be created", async () => {
  const newPerson = {
    firstName: "Terppa",
    lastName: "Testaaja",
    freeText: "Tämä on testihenkilö",
    titleId: 1,
    departmentId: 1,
    researchGroupId: 1,
    supervisorIds: [9999], // Invalid supervisor ID
  };

  await api.post("/api/people").send(newPerson).expect(500);
});

test("a person can be updated", async () => {
  const updatedPerson = {
    firstName: "Päivitetty nimi",
    lastName: "Päivitetty sukunimi",
    freeText: "Päivitetty kuvaus",
    titleId: 2,
    departmentId: 2,
    researchGroupId: 2,
    supervisorIds: [2, 3],
  };

  const response = await api
    .put("/api/people/1")
    .send(updatedPerson)
    .expect(200);

  const updated: Person = response.body;
  expect(updated.firstName).toBe(updatedPerson.firstName);
  expect(updated.lastName).toBe(updatedPerson.lastName);
  expect(updated.freeText).toBe(updatedPerson.freeText);
  expect(updated.titleId).toBe(updatedPerson.titleId);
  expect(updated.departmentId).toBe(updatedPerson.departmentId);
  expect(updated.researchGroupId).toBe(updatedPerson.researchGroupId);
  expect(updated.supervisors).toHaveLength(updatedPerson.supervisorIds.length);
});

test("a person cannot be updated with missing required fields", async () => {
  const updatedPerson = {
    firstName: "Päivitetty nimi",
    // lastName is missing
    titleId: 2,
  };

  const response = await api
    .put("/api/people/1")
    .send(updatedPerson)
    .expect(400);

  expect(response.body.error).toBe(
    "Invalid input: expected string, received undefined",
  );
});

test("a person cannot be updated with empty required fields", async () => {
  const updatedPerson = {
    firstName: "Päivitetty nimi",
    lastName: "",
    titleId: 2,
  };

  const response = await api
    .put("/api/people/1")
    .send(updatedPerson)
    .expect(400);

  expect(response.body.error).toBe("Last name is required");
});

test("updating a non-existent person returns 404", async () => {
  const updatedPerson = {
    firstName: "Päivitetty nimi",
    lastName: "Päivitetty sukunimi",
  };

  const response = await api
    .put("/api/people/9999")
    .send(updatedPerson)
    .expect(404);

  expect(response.body.error).toBe("Person not found");
});

test("a person's supervisors can be cleared", async () => {
  const updatedPerson = {
    firstName: "Päivitetty nimi",
    lastName: "Päivitetty sukunimi",
    supervisorIds: [],
  };

  const response = await api
    .put("/api/people/1")
    .send(updatedPerson)
    .expect(200);

  const updated: Person = response.body;
  expect(updated.supervisors).toHaveLength(0);
});

test("a person with invalid supervisor IDs cannot be updated", async () => {
  const updatedPerson = {
    firstName: "Päivitetty nimi",
    lastName: "Päivitetty sukunimi",
    supervisorIds: [9999],
  };

  await api.put("/api/people/1").send(updatedPerson).expect(500);
});
