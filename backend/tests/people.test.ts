import supertest from "supertest";
import app from "../src/app";
import { disconnectDatabase } from "../src/db";
import type { Person as PersonType } from "../src/models";
import { Contract, Person, Room } from "../src/models";
import {
  connectToDatabase,
  createAllTables,
  dropAllTables,
  seedData,
} from "../src/seed";

const api = supertest(app);

beforeEach(async () => {
  await connectToDatabase();
  await dropAllTables();
  await createAllTables();
  await seedData();
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

test("an existing person can be assigned to a room with a new contract", async () => {
  const person = await Person.findByPk(1, {
    include: [
      { model: Person, as: "supervisors", through: { attributes: [] } },
      "department",
      "title",
      "researchGroup",
      {
        model: Contract,
        as: "contracts",
        include: [{ model: Room, as: "room" }],
      },
    ],
  });

  const contractsBefore = await Contract.count({
    where: { personId: person!.id },
  });
  const peopleBefore = await Person.count();

  const assignExistingPerson = {
    personId: 1,
    roomId: 2,
    startDate: "2026-06-01",
    endDate: "2026-12-31",
  };

  const response = await api
    .post("/api/people")
    .send(assignExistingPerson)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const updatedPerson = response.body;
  expect(updatedPerson.id).toBe(1);
  expect(updatedPerson.contracts).toHaveLength(contractsBefore + 1);

  const peopleAfter = await Person.count();
  expect(peopleAfter).toBe(peopleBefore);
});

test("assigning a non-existent person to a room returns 404", async () => {
  const assignExistingPerson = {
    personId: 9999, // Non-existent person ID
    roomId: 2,
    startDate: "2026-06-01",
    endDate: "2026-12-31",
  };

  const response = await api
    .post("/api/people")
    .send(assignExistingPerson)
    .expect(404)
    .expect("Content-Type", /application\/json/);

  expect(response.body.error).toBe("Person not found");
});

test("assigning an existing person with invalid room ID fails", async () => {
  const assignExistingPerson = {
    personId: 1,
    roomId: 9999, // Invalid room ID
    startDate: "2026-06-01",
    endDate: "2026-12-31",
  };

  const response = await api
    .post("/api/people")
    .send(assignExistingPerson)
    .expect(500)
    .expect("Content-Type", /application\/json/);

  expect(response.body.error).toBe("Failed to add contract");
});

test("assigning an existing person to a room they already have a contract in fails", async () => {
  // Person 1 already has a contract in room 1 (from seed data)
  const assignExistingPerson = {
    personId: 1,
    roomId: 1,
    startDate: "2026-06-01",
    endDate: "2026-12-31",
  };

  const response = await api
    .post("/api/people")
    .send(assignExistingPerson)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  expect(response.body.error).toBe(
    "Person already has a contract for this room",
  );
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
    const lowercaseResponse = await api.get("/api/people?q=matti").expect(200);

    const uppercaseResponse = await api.get("/api/people?q=MATTI").expect(200);

    const mixedCaseResponse = await api.get("/api/people?q=MaTtI").expect(200);

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
      const matchesFirstName = person.firstName.toLowerCase().includes("ma");
      const matchesLastName = person.lastName.toLowerCase().includes("ma");
      expect(matchesFirstName || matchesLastName).toBe(true);
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
    const response = await api.get("/api/people?q=Jari").expect(200);

    expect(response.body).toHaveLength(1);
    const person = response.body[0];

    expect(person.supervisors).toBeDefined();
    expect(Array.isArray(person.supervisors)).toBe(true);

    // Jari Nieminen should have Matti Virtanen as supervisor (based on seed data)
    expect(person.supervisors.length).toBeGreaterThan(0);
    expect(person.supervisors[0].firstName).toBe("Matti");
  });

  test("search returns 500 when database query fails", async () => {
    const findAllSpy = jest
      .spyOn(Person, "findAll")
      .mockRejectedValueOnce(new Error("Database error"));

    const response = await api
      .get("/api/people?q=Matti")
      .expect(500)
      .expect("Content-Type", /application\/json/);

    expect(response.body.error).toBe("Failed to search people");
    findAllSpy.mockRestore();
  });
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

test("a persons contract with a room can be updated", async () => {
  const updatedPerson = {
    firstName: "Päivitetty nimi",
    lastName: "Päivitetty sukunimi",
    roomId: 1, // Same room as existing contract from seed data
    startDate: "2026-06-10",
    endDate: "2027-01-01",
  };

  const response = await api
    .put("/api/people/1")
    .send(updatedPerson)
    .expect(200);

  const updated: Person = response.body;
  expect(updated.contracts).toHaveLength(1);
  const contract = updated?.contracts?.[0];
  expect(contract?.roomId).toBe(1);
  expect(contract?.startDate).toBe("2026-06-10");
  expect(contract?.endDate).toBe("2027-01-01");
});

test("a new contract can be created for an existing person with a contract", async () => {
  const response = await api
    .put("/api/people/1")
    .send({
      firstName: "Matti",
      lastName: "Virtanen",
      roomId: 2,
      startDate: "2026-03-01",
      endDate: "2027-02-28",
    })
    .expect(200);

  const updated: Person = response.body;
  expect(updated.contracts).toHaveLength(2);
  const secondContract = updated?.contracts?.[1];
  expect(secondContract?.roomId).toBe(2);
  expect(secondContract?.startDate).toBe("2026-03-01");
  expect(secondContract?.endDate).toBe("2027-02-28");
});

test("updating a person with invalid room ID fails", async () => {
  const response = await api
    .put("/api/people/1")
    .send({
      firstName: "Matti",
      lastName: "Virtanen",
      roomId: 9999, // Invalid room ID
    })
    .expect(500);

  expect(response.body.error).toBe("Failed to update person");
});

test("updating a person's contract without dates maintains existing dates", async () => {
  const response = await api
    .put("/api/people/1")
    .send({
      firstName: "Matti",
      lastName: "Virtanen",
      roomId: 1, // Same room as existing contract from seed data
    })
    .expect(200);

  const updated: Person = response.body;
  expect(updated.contracts).toHaveLength(1);
  const updatedContract = updated?.contracts?.[0];
  expect(updatedContract?.startDate).toBe("2023-01-01");
  expect(updatedContract?.endDate).toBe("2025-12-31");
});

afterAll(async () => {
  await disconnectDatabase();
});
