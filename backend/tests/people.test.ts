import supertest from "supertest";
import app from "../src/app";
import { disconnectDatabase } from "../src/db";
import type { Person as PersonType } from "../src/models";
import { Person } from "../src/models";
import {
  connectToDatabase,
  createAllTables,
  dropAllTables,
  seedData,
} from "../src/seed";

const api = supertest(app);

describe("/api/people", () => {
  beforeEach(async () => {
    await connectToDatabase();
    await dropAllTables();
    await createAllTables();
    await seedData();
  });

  describe("POST /api/people", () => {
    it("a person can be created with a contract", async () => {
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

    it("a person can be created with a contract that does not have startDate and endDate", async () => {
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

    it("a person with missing required fields cannot be created", async () => {
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

    it("a person with invalid supervisor IDs cannot be created", async () => {
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
  });

  describe("GET /api/people", () => {
    it("people are returned as a list", async () => {
      const response = await api
        .get("/api/people")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const people: Person[] = response.body;
      expect(Array.isArray(people)).toBe(true);
      expect(people.length).toBeGreaterThan(0);
    });

    it("returns 500 if there is an error fetching people", async () => {
      // Temporarily override the findAll method to simulate an error
      const originalFindAll = Person.findAll;
      Person.findAll = jest.fn().mockRejectedValue(new Error("Database error"));

      await api.get("/api/people").expect(500);

      // Restore the original method
      Person.findAll = originalFindAll;
    });
  });

  describe("GET /api/people - search", () => {
    it("people can be searched by first name", async () => {
      const response = await api
        .get("/api/people?q=Matti")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].firstName).toBe("Matti");
      expect(response.body[0].lastName).toBe("Virtanen");
    });

    it("people can be searched by last name", async () => {
      const response = await api
        .get("/api/people?q=Virtanen")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].firstName).toBe("Matti");
      expect(response.body[0].lastName).toBe("Virtanen");
    });
    
    it("people can be searched by full name", async () => {
      const response = await api
        .get("/api/people?q=Matti Virtanen")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].firstName).toBe("Matti");
      expect(response.body[0].lastName).toBe("Virtanen");
    });

    it("search is case-insensitive", async () => {
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

    it("search supports partial matching", async () => {
      const response = await api.get("/api/people?q=Ma").expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((person: PersonType) => {
        const matchesFirstName = person.firstName.toLowerCase().includes("ma");
        const matchesLastName = person.lastName.toLowerCase().includes("ma");
        expect(matchesFirstName || matchesLastName).toBe(true);
      });
    });

    it("search returns people with department, title, research group, and contracts", async () => {
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

      expect(person.contracts).toBeDefined();
      expect(Array.isArray(person.contracts)).toBe(true);
      expect(person.contracts.length).toBeGreaterThan(0);
      expect(person.contracts[0].room).toBeDefined();
      expect(person.contracts[0].room.name).toBe("A210");
    });

    it("search returns empty array when no matches found", async () => {
      const response = await api
        .get("/api/people?q=NonexistentPerson")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      expect(response.body).toHaveLength(0);
      expect(response.body).toEqual([]);
    });

    it("fetches all people when query parameter is missing", async () => {
      const response = await api
        .get("/api/people")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      expect(response.body.length).toBeGreaterThan(0);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("fetches all people when query parameter is empty string", async () => {
      const response = await api
        .get("/api/people?q=")
        .expect(200)
        .expect("Content-Type", /application\/json/);

      expect(response.body.length).toBeGreaterThan(0);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("search returns 400 when query parameter is too long (over 100 characters)", async () => {
      const longQuery = "a".repeat(101);
      const response = await api
        .get(`/api/people?q=${longQuery}`)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      expect(response.body.error).toBe("Query too long");
    });

    it("multiple people can be found with partial match", async () => {
      const response = await api.get("/api/people?q=a").expect(200);

      expect(response.body.length).toBeGreaterThan(1);
      expect(response.body.length).toBeLessThanOrEqual(20); // Seeded data has 20 people
    });

    it("search includes supervisors in response", async () => {
      const response = await api.get("/api/people?q=Jari").expect(200);

      expect(response.body).toHaveLength(1);
      const person = response.body[0];

      expect(person.supervisors).toBeDefined();
      expect(Array.isArray(person.supervisors)).toBe(true);

      // Jari Nieminen should have Matti Virtanen as supervisor (based on seed data)
      expect(person.supervisors.length).toBeGreaterThan(0);
      expect(person.supervisors[0].firstName).toBe("Matti");
    });

    it("search returns 500 when database query fails", async () => {
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

  describe("PUT /api/people", () => {
    it("a person can be updated", async () => {
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
      expect(updated.supervisors).toHaveLength(
        updatedPerson.supervisorIds.length,
      );
    });

    it("a person cannot be updated with missing required fields", async () => {
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

    it("a person cannot be updated with empty required fields", async () => {
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

    it("updating a non-existent person returns 404", async () => {
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

    it("a person's supervisors can be cleared", async () => {
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

    it("a person with invalid supervisor IDs cannot be updated", async () => {
      const updatedPerson = {
        firstName: "Päivitetty nimi",
        lastName: "Päivitetty sukunimi",
        supervisorIds: [9999],
      };

      await api.put("/api/people/1").send(updatedPerson).expect(500);
    });

    it("a persons contract with a room can be updated", async () => {
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

    it("a new contract can be created for an existing person with a contract", async () => {
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

    it("updating a person with invalid room ID fails", async () => {
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

    it("updating a person's contract without dates maintains existing dates", async () => {
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
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  test("can search by supervisor name", async () => {
    const response = await api
      .get("/api/people?q=Matti&type=supervisorName")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.length).toBeGreaterThan(0);
    response.body.forEach((person: PersonType) => {
      expect(person.supervisors).toBeDefined();
      const hasMattisupervisor = person.supervisors?.some((supervisor) =>
        supervisor.firstName.toLowerCase().includes("matti"),
      );
      expect(hasMattisupervisor).toBe(true);
    });
  });

  test("supervisor name search is case-insensitive", async () => {
    const lowercaseResponse = await api
      .get("/api/people?q=matti&type=supervisorName")
      .expect(200);

    const uppercaseResponse = await api
      .get("/api/people?q=MATTI&type=supervisorName")
      .expect(200);

    expect(lowercaseResponse.body.length).toBeGreaterThan(0);
    expect(uppercaseResponse.body.length).toBeGreaterThan(0);
    expect(lowercaseResponse.body.length).toBe(uppercaseResponse.body.length);
  });

  test("supervisor name search returns empty array when no matches found", async () => {
    const response = await api
      .get("/api/people?q=NonexistentSupervisor&type=supervisorName")
      .expect(200);

    expect(response.body).toHaveLength(0);
  });

  test("supervisor name search returns subordinates when exactly one supervisor matches", async () => {
    const response = await api
      .get("/api/people?q=Matti&type=supervisorName")
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    response.body.forEach((person: PersonType) => {
      expect(person.firstName).not.toBe("Matti");
      const hasMattisupervisor = person.supervisors?.some(
        (supervisor) => supervisor.firstName === "Matti",
      );
      expect(hasMattisupervisor).toBe(true);
    });
  });

  test("supervisor name search returns supervisors when multiple supervisors match", async () => {
    const response = await api
      .get("/api/people?q=a&type=supervisorName")
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    response.body.forEach((person: PersonType) => {
      const matchesFirstName = person.firstName.toLowerCase().includes("a");
      const matchesLastName = person.lastName.toLowerCase().includes("a");
      expect(matchesFirstName || matchesLastName).toBe(true);
      expect(person?.subordinates?.length).toBeGreaterThan(0);
    });

    const firstNames = response.body.map(
      (person: PersonType) => person.firstName,
    );
    expect(firstNames).toContain("Sanna");
    expect(firstNames).toContain("Matti");
  });

  test("can search by contract end date", async () => {
    const response = await api
      .get("/api/people?q=2025-12-31&type=contractEndDate")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.length).toBeGreaterThan(0);
    response.body.forEach((person: PersonType) => {
      expect(person.contracts).toBeDefined();
      const hasMatchingContract = person.contracts?.some((contract) => {
        if (!contract.endDate) return false;
        const endDateStr = new Date(contract.endDate)
          .toISOString()
          .split("T")[0];
        return endDateStr <= "2025-12-31";
      });
      expect(hasMatchingContract).toBe(true);
    });
  });

  test("contract end date search returns empty array when no matches found", async () => {
    const response = await api
      .get("/api/people?q=2020-01-01&type=contractEndDate")
      .expect(200);

    expect(response.body).toHaveLength(0);
  });
});
