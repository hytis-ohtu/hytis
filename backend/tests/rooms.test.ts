import assert from "assert";
import supertest from "supertest";
import app from "../src/app";
import { contracts } from "../src/data/contracts";
import { departments } from "../src/data/departments";
import { people } from "../src/data/people";
import { rooms } from "../src/data/rooms";
import { titles } from "../src/data/titles";
import type { Contract } from "../src/models";
import { createAllTables, dropAllTables, seedData } from "../src/seed";
import type { ExpectedContract } from "../src/types/other";

const api = supertest(app);

beforeEach(async () => {
  await dropAllTables();
  await createAllTables();
  await seedData();
});

const validateContract = (
  contract: Contract,
  expectedContract: ExpectedContract,
) => {
  const expectedPerson = people.find(
    (person) => person.id === expectedContract.personId,
  );
  const expectedDepartment = departments.find(
    (dept) => dept.id === expectedPerson?.departmentId,
  );
  const expectedTitle = titles.find(
    (title) => title.id === expectedPerson?.titleId,
  );

  assert(expectedPerson, "expected person should be defined");
  assert(expectedDepartment, "expected department should be defined");
  assert(expectedTitle, "expected title should be defined");

  expect(contract).toMatchObject({
    startDate: expectedContract.startDate.toISOString().slice(0, 10),
    endDate: expectedContract.endDate.toISOString().slice(0, 10),
    person: {
      firstName: expectedPerson.firstName,
      lastName: expectedPerson.lastName,
      department: { name: expectedDepartment.name },
      title: { name: expectedTitle.name },
    },
  });
};

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

test("returns correct room data", async () => {
  const response = await api.get("/api/rooms").expect(200);
  const returnedRoom = response.body[0];
  const expectedRoom = rooms[0];
  const expectedContracts = contracts.filter(
    (contract) => contract.roomId === expectedRoom.id,
  );

  expect(returnedRoom).toBeDefined();
  expect(returnedRoom.id).toBe(expectedRoom.id);
  expect(parseFloat(returnedRoom.area)).toBe(expectedRoom.area);
  expect(returnedRoom.capacity).toBe(expectedRoom.capacity);
  expect(returnedRoom.contracts).toHaveLength(expectedContracts.length);
  expect(returnedRoom.contracts).toEqual(
    expectedContracts.map((contract) => ({ id: contract.id })),
  );
});

test("single room is returned", async () => {
  const response = await api.get("/api/rooms/1").expect(200);
  const returnedRoom = response.body;
  const expectedRoom = rooms[0];
  const expectedContracts = contracts.filter(
    (contract) => contract.roomId === expectedRoom.id,
  );

  expect(returnedRoom.id).toBe(expectedRoom.id);
  expect(returnedRoom.name).toBe(expectedRoom.name);
  expect(parseFloat(returnedRoom.area)).toBe(expectedRoom.area);
  expect(returnedRoom.contracts).toHaveLength(expectedContracts.length);

  returnedRoom.contracts.forEach((contract: Contract, index: number) =>
    validateContract(contract, expectedContracts[index]),
  );
});
