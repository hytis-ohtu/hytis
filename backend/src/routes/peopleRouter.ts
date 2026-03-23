import { Request, Response, Router } from "express";
import { Op } from "sequelize";
import { Person, PersonSupervisor } from "../models";

const router = Router();

/**
 * POST /api/people
 * Creates a new person with the provided first name and last name
 * Optionally, titleId, departmentId, researchGroupId, freeText and supervisorIds can be provided
 */

router.post("/", async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    titleId,
    departmentId,
    researchGroupId,
    freeText,
    supervisorIds,
  } = req.body;

  if (!firstName || !lastName) {
    return res
      .status(400)
      .json({ error: "First name and last name are required" });
  }

  try {
    const newPerson = await Person.create({
      firstName,
      lastName,
      titleId,
      departmentId,
      researchGroupId,
      freeText,
    });

    if (supervisorIds && supervisorIds.length > 0) {
      await PersonSupervisor.bulkCreate(
        supervisorIds.map((supervisorId: number) => ({
          supervisorId,
          subordinateId: newPerson.id,
        })),
      );
    }

    const createdPerson = await Person.findByPk(newPerson.id, {
      include: [
        { model: Person, as: "supervisors", through: { attributes: [] } },
      ],
    });
    res.status(201).json(createdPerson);
  } catch (error) {
    console.error("Error creating person:", error);
    res.status(500).json({ error: "Failed to create person" });
  }
});

/**
 * GET /api/people
 * Searches for people by first name or last name
 * Query parameter 'q' is used for partial matching
 */
router.get("/", async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  if (q.length > 100) {
    return res.status(400).json({ error: "Query too long" });
  }

  try {
    const people = await Person.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${q}%` } },
          { lastName: { [Op.iLike]: `%${q}%` } },
        ],
      },
      include: [
        { model: Person, as: "supervisors", through: { attributes: [] } },
        "department",
        "title",
        "researchGroup",
      ],
    });

    res.json(people);
  } catch (error) {
    console.error("Error searching people:", error);
    res.status(500).json({ error: "Failed to search people" });
  }
});

export default router;
