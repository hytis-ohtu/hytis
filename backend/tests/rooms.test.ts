import supertest from "supertest";
import app from "../src/app";
import { contracts } from "../src/data/contracts";
import { rooms } from "../src/data/rooms";
import type { Contract } from "../src/models";
import { createAllTables, dropAllTables, seedData } from "../src/seed";
import { validateContract } from "./testHelpers";

const api = supertest(app);

beforeEach(async () => {
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

test("returns 404 for non-existing room", async () => {
  const response = await api.get("/api/rooms/9999").expect(404);
  expect(response.body.error).toBe("Room not found.");
});
