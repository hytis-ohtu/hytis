import supertest from "supertest";
import app from "../src/app";
import { disconnectDatabase } from "../src/db";
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

describe("/api/contracts", () => {
  beforeEach(async () => {
    await connectToDatabase();
    await dropAllTables();
    await createAllTables();
    await seedData();
  });
  
  afterAll(async () => {
    await disconnectDatabase();
  });
  
  describe("DELETE /api/contracts", () => {
    it("delete contract returns 204", async () => {
      await api.delete(`/api/contracts/${mockContract.id}`).expect(204);

      const deletedContract = await Contract.findByPk(mockContract.id);
      expect(deletedContract).toBeNull();
    });

    it("delete contract returns 404 for non-existing contract", async () => {
      const response = await api
        .delete("/api/contracts/9999")
        .expect(404)
        .expect("Content-Type", /application\/json/);

      expect(response.body.error).toBe("Contract not found");
    });

    it("deleting contract does not delete person or room", async () => {
      const { personId, roomId } = mockContract;

      await api.delete(`/api/contracts/${mockContract.id}`).expect(204);

      const person = await Person.findByPk(personId);
      expect(person).not.toBeNull();
      expect(person?.id).toBe(personId);

      const room = await Room.findByPk(roomId);
      expect(room).not.toBeNull();
      expect(room?.id).toBe(roomId);
    });

    it("delete contract returns 500 on internal server error", async () => {
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
  });

  describe("POST /api/contracts", () => {
    it("creates a contract with all fields", async () => {
      const contractData = {
        personId: 1,
        roomId: 2,
        startDate: "2026-06-01",
        endDate: "2026-12-31",
      };

      const response = await api
        .post("/api/contracts")
        .send(contractData)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const contract: Contract = response.body;
      expect(contract.personId).toBe(1);
      expect(contract.roomId).toBe(2);
      expect(contract.startDate).toBe("2026-06-01");
      expect(contract.endDate).toBe("2026-12-31");
    });
    
    it("creates a contract without dates", async () => {
      const contractData = {
        personId: 1,
        roomId: 2,
      };

      const response = await api
        .post("/api/contracts")
        .send(contractData)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const contract: Contract = response.body;
      expect(contract.personId).toBe(1);
      expect(contract.roomId).toBe(2);
      expect(contract.startDate).toBeNull();
      expect(contract.endDate).toBeNull();
    });
    
    it("returns 400 when personId is missing", async () => {
      const contractData = {
        roomId: 2,
        startDate: "2026-06-01",
      };

      const response = await api
        .post("/api/contracts")
        .send(contractData)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      expect(response.body.error).toBe("personId is required");
    });
    
    it("returns 400 when roomId is missing", async () => {
      const contractData = {
        personId: 1,
        startDate: "2026-06-01",
      };

      const response = await api
        .post("/api/contracts")
        .send(contractData)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      expect(response.body.error).toBe("roomId is required");
    });
    
    it("returns 404 when person does not exist", async () => {
      const contractData = {
        personId: 9999,
        roomId: 2,
      };

      const response = await api
        .post("/api/contracts")
        .send(contractData)
        .expect(404)
        .expect("Content-Type", /application\/json/);

      expect(response.body.error).toBe("Person not found");
    });
    
    it("returns 404 when room does not exist", async () => {
      const contractData = {
        personId: 1,
        roomId: 9999,
      };

      const response = await api
        .post("/api/contracts")
        .send(contractData)
        .expect(404)
        .expect("Content-Type", /application\/json/);

      expect(response.body.error).toBe("Room not found");
    });
    
    it("returns 400 when person already has a contract for the room", async () => {
      // Person 1 already has a contract in room 1 (from seed data)
      const contractData = {
        personId: 1,
        roomId: 1,
      };

      const response = await api
        .post("/api/contracts")
        .send(contractData)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      expect(response.body.error).toBe(
        "Person already has a contract for this room",
      );
    });
    
    it("returns 500 on internal server error", async () => {
      const spy = jest
        .spyOn(Contract, "create")
        .mockRejectedValueOnce(new Error("Database error"));

      const contractData = {
        personId: 1,
        roomId: 2,
      };

      const response = await api
        .post("/api/contracts")
        .send(contractData)
        .expect(500)
        .expect("Content-Type", /application\/json/);

      expect(response.body.error).toBe("Failed to create contract");

      spy.mockRestore();
    });
  });
});