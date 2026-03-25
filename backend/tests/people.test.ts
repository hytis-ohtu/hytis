import supertest from "supertest";
import app from "../src/app";
import { Person } from "../src/models";
import type { Person as PersonType } from "../src/models";
import {
  connectToDatabase,
  createAllTables,
  dropAllTables,
  fixSequences,
  seedData,
} from "../src/seed";

const api = supertest(app);

beforeEach(async () => {
  await connectToDatabase();
  await dropAllTables();
  await createAllTables();
  await seedData();
  await fixSequences();
});

test("a person can be created with a contract", async () => {
  const newPerson = {
    firstName: "Terppa",
    lastName: "Testaaja",
    titleId: 1,
    departmentId: 1,
    researchGroupId: 1,
    freeText: "Tämä on testihenkilö",
    supervisorIds: [1, 2],
    roomId: 1,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
  };

  const response = await api
    .post("/api/people")
    .send(newPerson)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const createdPerson: PersonType = response.body;
  expect(createdPerson.firstName).toBe(newPerson.firstName);
  expect(createdPerson.lastName).toBe(newPerson.lastName);
  expect(createdPerson.freeText).toBe(newPerson.freeText);
  expect(createdPerson.titleId).toBe(newPerson.titleId);
  expect(createdPerson.departmentId).toBe(newPerson.departmentId);
  expect(createdPerson.researchGroupId).toBe(newPerson.researchGroupId);
  expect(createdPerson.supervisors).toHaveLength(
    newPerson.supervisorIds.length,
  );

  expect(createdPerson.contracts).toHaveLength(1);
  expect(createdPerson.contracts![0].roomId).toBe(newPerson.roomId);
  expect(createdPerson.contracts![0].startDate).toBe(newPerson.startDate);
  expect(createdPerson.contracts![0].endDate).toBe(newPerson.endDate);
});

test("a person can be created with a contract that does not have startDate and endDate", async () => {
  const newPerson = {
    firstName: "Terppa",
    lastName: "Testaaja",
    titleId: 1,
    departmentId: 1,
    researchGroupId: 1,
    freeText: "Tämä on testihenkilö",
    supervisorIds: [1, 2],
    roomId: 1,
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

  expect(createdPerson.contracts).toHaveLength(1);
  expect(createdPerson.contracts![0].roomId).toBe(newPerson.roomId);
  expect(createdPerson.contracts![0].startDate).toBeNull();
  expect(createdPerson.contracts![0].endDate).toBeNull();
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

  await api.post("/api/people").send(newPerson).expect(400);
});

describe("GET /api/people", () => {
  test("people are returned as a list", async () => {
    const response = await api
      .get("/api/people")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const people: Person[] = response.body;
    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toBeGreaterThan(0);
  });

  test("returns 500 if there is an error fetching people", async () => {
    // Temporarily override the findAll method to simulate an error
    const originalFindAll = Person.findAll;
    Person.findAll = jest.fn().mockRejectedValue(new Error("Database error"));

    await api.get("/api/people").expect(500);

    // Restore the original method
    Person.findAll = originalFindAll;
  });
});

describe("GET /api/people - search", () => {
  test("people can be searched by first name", async () => {
    const response = await api
      .get("/api/people?q=Matti")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].firstName).toBe("Matti");
    expect(response.body[0].lastName).toBe("Virtanen");
  });

  test("people can be searched by last name", async () => {
    const response = await api
      .get("/api/people?q=Virtanen")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].firstName).toBe("Matti");
    expect(response.body[0].lastName).toBe("Virtanen");
  });

  test("search is case-insensitive", async () => {
    const lowercaseResponse = await api
      .get("/api/people?q=matti")
      .expect(200);

    const uppercaseResponse = await api
      .get("/api/people?q=MATTI")
      .expect(200);

    const mixedCaseResponse = await api
      .get("/api/people?q=MaTtI")
      .expect(200);

    expect(lowercaseResponse.body).toHaveLength(1);
    expect(uppercaseResponse.body).toHaveLength(1);
    expect(mixedCaseResponse.body).toHaveLength(1);

    expect(lowercaseResponse.body[0].firstName).toBe("Matti");
    expect(uppercaseResponse.body[0].firstName).toBe("Matti");
    expect(mixedCaseResponse.body[0].firstName).toBe("Matti");
  });

  test("search supports partial matching", async () => {
    const response = await api.get("/api/people?q=Ma").expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    response.body.forEach((person: PersonType) => {
      const matchesFirstName = person.firstName
        .toLowerCase()
        .includes("ma");
      const matchesLastName = person.lastName.toLowerCase().includes("ma");
      expect(
        matchesFirstName || matchesLastName,
      ).toBe(true);
    });
  });

  test("search returns people with department, title, and research group", async () => {
    const response = await api.get("/api/people?q=Matti").expect(200);

    expect(response.body).toHaveLength(1);
    const person = response.body[0];

    expect(person.department).toBeDefined();
    expect(person.department.name).toBe("H516 MATHSTAT");

    expect(person.title).toBeDefined();
    expect(person.title.name).toBe("asiantuntija");

    expect(person.researchGroup).toBeDefined();
    expect(person.researchGroup.name).toBe(
      "Algebrallisten rakenteiden tutkimusryhmä",
    );
  });

  test("search returns empty array when no matches found", async () => {
    const response = await api
      .get("/api/people?q=NonexistentPerson")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toHaveLength(0);
    expect(response.body).toEqual([]);
  });

  test("fetches all people when query parameter is missing", async () => {
    const response = await api
      .get("/api/people")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.length).toBeGreaterThan(0);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("fetches all people when query parameter is empty string", async () => {
    const response = await api
      .get("/api/people?q=")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.length).toBeGreaterThan(0);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("search returns 400 when query parameter is too long (over 100 characters)", async () => {
    const longQuery = "a".repeat(101);
    const response = await api
      .get(`/api/people?q=${longQuery}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(response.body.error).toBe("Query too long");
  });

  test("multiple people can be found with partial match", async () => {
    const response = await api.get("/api/people?q=a").expect(200);

    expect(response.body.length).toBeGreaterThan(1);
    expect(response.body.length).toBeLessThanOrEqual(20); // Seeded data has 20 people
  });

  test("search includes supervisors in response", async () => {
    const response = await api
      .get("/api/people?q=Jari")
      .expect(200);

    expect(response.body).toHaveLength(1);
    const person = response.body[0];

    expect(person.supervisors).toBeDefined();
    expect(Array.isArray(person.supervisors)).toBe(true);

    // Jari Nieminen should have Matti Virtanen as supervisor (based on seed data)
    expect(person.supervisors.length).toBeGreaterThan(0);
    expect(person.supervisors[0].firstName).toBe("Matti");
  });

  test("search returns 500 when database query fails", async () => {
    const findAllSpy = jest.spyOn(Person, "findAll").mockRejectedValueOnce(new Error("Database error"));

    const response = await api
      .get("/api/people?q=Matti")
      .expect(500)
      .expect("Content-Type", /application\/json/);

    expect(response.body.error).toBe("Failed to search people");
    findAllSpy.mockRestore();
  });
});
