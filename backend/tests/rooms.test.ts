import supertest from "supertest";
import app from "../src/app";
import { rooms } from "../src/data/rooms";
import type { Contract } from "../src/models";
import {
  connectToDatabase,
  createAllTables,
  dropAllTables,
  seedData,
} from "../src/seed";
import { mockContracts, mockPeople, mockRoom } from "./mockData";
import { validateContract } from "./testHelpers";

const api = supertest(app);

beforeEach(async () => {
  await connectToDatabase();
  await dropAllTables();
  await createAllTables();
  await seedData();
});

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

  expect(returnedRoom).toBeDefined();
  expect(returnedRoom.id).toBe(mockRoom.id);
  expect(parseFloat(returnedRoom.area)).toBe(mockRoom.area);
  expect(returnedRoom.capacity).toBe(mockRoom.capacity);
  expect(returnedRoom.contracts).toHaveLength(mockContracts.length);
  expect(returnedRoom.contracts).toEqual(
    mockContracts.map((contract) => ({ id: contract.id })),
  );
  expect(returnedRoom.department.id).toBe(mockRoom.departmentId);
});

test("single room is returned", async () => {
  const response = await api.get("/api/rooms/1").expect(200);
  const returnedRoom = response.body;

  expect(returnedRoom.id).toBe(mockRoom.id);
  expect(returnedRoom.name).toBe(mockRoom.name);
  expect(parseFloat(returnedRoom.area)).toBe(mockRoom.area);
  expect(returnedRoom.freeText).toBe(mockRoom.freeText);
  expect(returnedRoom.roomType).toBe(mockRoom.roomType);
  expect(returnedRoom.contracts).toHaveLength(mockContracts.length);

  returnedRoom.contracts.forEach((contract: Contract, index: number) =>
    validateContract(contract, mockContracts[index]),
  );

  const firstPerson = returnedRoom.contracts[0].person;
  expect(firstPerson.id).toBe(mockPeople[0].id);
  expect(firstPerson.freeText).toBe(mockPeople[0].freeText);
  expect(firstPerson.department.id).toBe(mockPeople[0].departmentId);
  expect(firstPerson.title.id).toBe(mockPeople[0].titleId);
  expect(firstPerson.researchGroup.id).toBe(mockPeople[0].researchGroupId);

  expect(returnedRoom.department.id).toBe(mockRoom.departmentId);
});

test("returns 404 for non-existing room", async () => {
  const response = await api.get("/api/rooms/9999").expect(404);
  expect(response.body.error).toBe("Room not found.");
});
