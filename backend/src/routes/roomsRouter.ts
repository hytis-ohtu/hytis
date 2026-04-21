import { Request, Response, Router } from "express";
import { z } from "zod";
import {
  Contract,
  Department,
  Person,
  ResearchGroup,
  Room,
  RoomType,
  Title,
} from "../models";
import type { RoomInput } from "../utils";
import { toRoomInput } from "../utils";

const router = Router();

/**
 * GET /api/rooms
 * Returns a list of all rooms with id, name, area, capacity and contract ids
 * Returns empty array if no rooms exist
 */
router.get(
  "/",
  async (_req: Request, res: Response<Room[]>): Promise<Response<Room[]>> => {
    const rooms = await Room.findAll({
      attributes: ["id", "name", "area", "capacity", "roomTypeId"],
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: Contract,
          as: "contracts",
          attributes: ["id"],
        },
        {
          model: RoomType,
          as: "roomType",
          attributes: ["id", "name"],
        },
      ],
    });

    return res.status(200).json(rooms);
  },
);

/**
 * GET /api/rooms/:id
 * Returns room details with associated contracts and personnel information
 * Returns 404 if room not found
 */
router.get(
  "/:id",
  async (
    req: Request<{ id: string }>,
    res: Response<Room | { error: string }>,
  ): Promise<Response<Room | { error: string }>> => {
    const room = await Room.findByPk(req.params.id, {
      attributes: ["id", "name", "area", "freeText", "capacity", "roomTypeId"],
      order: [[{ model: Contract, as: "contracts" }, "id", "ASC"]],
      include: [
        {
          model: Contract,
          as: "contracts",
          attributes: ["id", "startDate", "endDate"],
          include: [
            {
              model: Person,
              as: "person",
              attributes: ["id", "firstName", "lastName", "freeText"],
              include: [
                {
                  model: Department,
                  as: "department",
                  attributes: ["id", "name"],
                },
                {
                  model: Title,
                  as: "title",
                  attributes: ["id", "name"],
                },
                {
                  model: ResearchGroup,
                  as: "researchGroup",
                  attributes: ["id", "name"],
                },
                {
                  model: Person,
                  as: "supervisors",
                  attributes: ["id", "firstName", "lastName"],
                  through: { attributes: [] },
                },
              ],
            },
          ],
        },
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: RoomType,
          as: "roomType",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found." });
    }

    return res.status(200).json(room);
  },
);

/**
 * PUT /api/rooms/:id
 * Updates a room with the capacity, departmentId freeText and roomType provided in the request body
 * Returns 404 if room not found
 */

router.put(
  "/:id",
  async (
    req: Request<{ id: string }, Room | { error: string }, RoomInput>,
    res: Response<Room | { error: string }>,
  ): Promise<Response<Room | { error: string }>> => {
    const roomId = req.params.id;
    let roomInput: RoomInput;

    try {
      roomInput = toRoomInput(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: error.issues.map((issue) => issue.message).join(", "),
        });
      }
      return res.status(500).json({ error: "Failed to parse room input" });
    }

    const { capacity, departmentId, freeText, roomTypeId } = roomInput;

    try {
      const room = await Room.findByPk(Number(roomId));

      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      await room.update({
        capacity,
        departmentId,
        freeText,
        roomTypeId,
      });

      await room.reload({
        attributes: [
          "id",
          "name",
          "area",
          "freeText",
          "capacity",
          "roomTypeId",
        ],
        include: [
          {
            model: Department,
            as: "department",
            attributes: ["id", "name"],
          },
          {
            model: Contract,
            as: "contracts",
            attributes: ["id"],
          },
          {
            model: RoomType,
            as: "roomType",
            attributes: ["id", "name"],
          },
        ],
      });

      return res.status(200).json(room);
    } catch (error) {
      console.error("Error updating room:", error);
      return res.status(500).json({ error: "Failed to update room" });
    }
  },
);

export default router;
