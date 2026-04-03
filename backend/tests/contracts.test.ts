import supertest from "supertest";
import app from "../src/app";
import { Contract, Person, Room } from "../src/models";
import {
  connectToDatabase,
  createAllTables,
  dropAllTables,
  seedData,
} from "../src/seed";
import { mockContracts } from "./mockData";

const api = supertest(app);
const mockContract = mockContracts[0];

beforeEach(async () => {
  await connectToDatabase();
  await dropAllTables();
  await createAllTables();
  await seedData();
});

test("delete contract returns 204", async () => {
  await api.delete(`/api/contracts/${mockContract.id}`).expect(204);

  const deletedContract = await Contract.findByPk(mockContract.id);
  expect(deletedContract).toBeNull();
});

test("delete contract returns 404 for non-existing contract", async () => {
  const response = await api
    .delete("/api/contracts/9999")
    .expect(404)
    .expect("Content-Type", /application\/json/);

  expect(response.body.error).toBe("Contract not found");
});

test("deleting contract does not delete person or room", async () => {
  const { personId, roomId } = mockContract;

  await api.delete(`/api/contracts/${mockContract.id}`).expect(204);

  const person = await Person.findByPk(personId);
  expect(person).not.toBeNull();
  expect(person?.id).toBe(personId);

  const room = await Room.findByPk(roomId);
  expect(room).not.toBeNull();
  expect(room?.id).toBe(roomId);
});

test("delete contract returns 500 on internal server error", async () => {
  const spy = jest
    .spyOn(Contract, "findByPk")
    .mockRejectedValueOnce(new Error("Database error"));

  const response = await api
    .delete(`/api/contracts/${mockContract.id}`)
    .expect(500)
    .expect("Content-Type", /application\/json/);

  expect(response.body.error).toBe("Failed to delete contract");

  spy.mockRestore();
});
