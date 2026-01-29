import { Request, Response, Router } from "express";
import { Contract, Department, Person, Room, Title } from "../models";

const router = Router();

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
