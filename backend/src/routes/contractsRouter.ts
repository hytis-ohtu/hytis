import { Request, Response, Router } from "express";
import { Contract, Person, Room } from "../models";

const router = Router();

/**
 * DELETE /api/contracts/:id
 * Deletes a contract between a person and a room
 * Returns 204 No Content on success
 * Returns 404 if contract not found
 */
router.delete(
  "/:id",
  async (
    req: Request<{ id: string }>,
    res: Response<{ error: string }>,
  ): Promise<Response<{ error: string }>> => {
    try {
      const { id } = req.params;

      const contract = await Contract.findByPk(Number(id));

      if (!contract) {
        return res.status(404).json({
          error: "Contract not found",
        });
      }

      await contract.destroy();

      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting contract:", error);
      return res.status(500).json({
        error: "Failed to delete contract",
      });
    }
  },
);

/**
 * POST /api/contracts
 * Creates a new contract for an existing person
 * Requires personId, roomId, startDate (optional), endDate (optional) in body
 */
router.post(
  "/",
  async (
    req: Request<
      object,
      { error?: string } | Contract,
      { personId: number; roomId: number; startDate?: Date; endDate?: Date }
    >,
    res: Response<{ error?: string } | Contract>,
  ) => {
    const { personId, roomId, startDate, endDate } = req.body;

    if (!personId) {
      return res.status(400).json({ error: "personId is required" });
    }

    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }

    try {
      const person = await Person.findByPk(Number(personId));

      if (!person) {
        return res.status(404).json({ error: "Person not found" });
      }

      const room = await Room.findByPk(Number(roomId));

      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const existingContract = await Contract.findOne({
        where: {
          personId: Number(personId),
          roomId: Number(roomId),
        },
      });

      if (existingContract) {
        return res.status(400).json({
          error: "Person already has a contract for this room",
        });
      }

      const contract = await Contract.create({
        personId: Number(personId),
        roomId: Number(roomId),
        startDate: startDate ?? null,
        endDate: endDate ?? null,
      });

      return res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      return res.status(500).json({ error: "Failed to create contract" });
    }
  },
);

export default router;
