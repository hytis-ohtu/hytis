import { Request, Response, Router } from "express";
import { Contract, Department, Person, Room, Title } from "../models";

const router = Router();

/**
 * GET /api/rooms
 * Returns a list of all rooms with id and name
 * Returns empty array if no rooms exist
 */
router.get(
  "/",
  async (_req: Request, res: Response<Room[]>): Promise<Response<Room[]>> => {
    const rooms = await Room.findAll({ attributes: ["id", "name"] });

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
      attributes: ["id", "name", "area"],
      include: [
        {
          model: Contract,
          as: "contracts",
          attributes: ["startDate", "endDate"],
          include: [
            {
              model: Person,
              as: "person",
              attributes: ["firstName", "lastName"],
              include: [
                {
                  model: Department,
                  as: "department",
                  attributes: ["name"],
                },
                {
                  model: Title,
                  as: "title",
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found." });
    }

    return res.status(200).json(room);
  },
);

export default router;
