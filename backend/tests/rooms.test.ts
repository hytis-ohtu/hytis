import supertest from "supertest";
import app from "../src/app";
import { rooms } from "../src/data/rooms";
import { disconnectDatabase } from "../src/db";
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

describe("PUT /api/rooms/:id", () => {
  it("a room can be updated", async () => {
    const updatedRoomData = {
      capacity: 10,
      departmentId: 1,
      freeText: "Päivitetty vapaa teksti",
      roomType: "Päivitetty huonetyyppi",
    };

    const response = await api
      .put("/api/rooms/1")
      .send(updatedRoomData)
      .expect(200);

    const updatedRoom = response.body;
    expect(updatedRoom.capacity).toBe(updatedRoomData.capacity);
    expect(updatedRoom.freeText).toBe(updatedRoomData.freeText);
    expect(updatedRoom.roomType).toBe(updatedRoomData.roomType);
  });

  it("returns 404 when updating non-existing room", async () => {
    const updatedRoomData = {
      capacity: 10,
      departmentId: 1,
      freeText: "Päivitetty vapaa teksti",
      roomType: "Päivitetty huonetyyppi",
    };

    const response = await api
      .put("/api/rooms/9999")
      .send(updatedRoomData)
      .expect(404);

    expect(response.body.error).toBe("Room not found");
  });

  it("returns 400 when updating room with invalid data", async () => {
    const invalidRoomData = {
      capacity: -5, // Invalid capacity
      departmentId: 1,
      freeText: "Päivitetty vapaa teksti",
      roomType: "Päivitetty huonetyyppi",
    };

    const response = await api
      .put("/api/rooms/1")
      .send(invalidRoomData)
      .expect(400);

    expect(response.body.error).toBe("Capacity must be non-negative");
  });

  it("returns 500 when updating fails due to server error", async () => {
    const updatedRoomData = {
      capacity: 10,
      departmentId: 1,
      freeText: "Päivitetty vapaa teksti",
      roomType: "Päivitetty huonetyyppi",
    };

    // Simulate server error by disconnecting from the database
    await dropAllTables();

    const response = await api
      .put("/api/rooms/1")
      .send(updatedRoomData)
      .expect(500);

    expect(response.body.error).toBe("Failed to update room");
  });

  afterAll(async () => {
    await disconnectDatabase();
  });
});
