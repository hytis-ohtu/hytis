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

router.get(
  "/:id",
  async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<Response<Room>> => {
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
      return res.json({ error: "Room not found." });
    }

    return res.json(room);
  },
);

export default router;
