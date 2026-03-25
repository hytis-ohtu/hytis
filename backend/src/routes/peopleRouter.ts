import { Request, Response, Router } from "express";
import { Op } from "sequelize";
import { Contract, Person, PersonSupervisor, Room } from "../models";

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
    roomId,
    startDate,
    endDate,
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

    if (roomId) {
      await Contract.create({
        personId: newPerson.id,
        roomId,
        startDate,
        endDate,
      });
    }

    if (supervisorIds && supervisorIds.length > 0) {
      // Validate that all supervisor IDs exist
      const supervisors = await Person.findAll({
        where: { id: supervisorIds },
        attributes: ["id"],
      });

      if (supervisors.length !== supervisorIds.length) {
        // Rollback: delete the created person since validation failed
        await newPerson.destroy();
        return res.status(400).json({ error: "One or more supervisor IDs are invalid" });
      }

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
        {
          model: Contract,
          as: "contracts",
          include: [{ model: Room, as: "room" }],
        },
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
 * Fetches all people, or searches if query parameter 'q' is provided
 * Query parameter 'q' is used for partial matching on first/last name
 */
router.get("/", async (req: Request, res: Response) => {
  const { q } = req.query;

  // If query parameter 'q' is provided, search people
  if (q && typeof q === "string") {
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
  } else {
    // No query parameter - fetch all people
    try {
      const people = await Person.findAll({
        order: [
          ["lastName", "ASC"],
          ["firstName", "ASC"],
        ],
      });
      res.status(200).json(people);
    } catch (error) {
      console.error("Error fetching people:", error);
      res.status(500).json({ error: "Failed to fetch people" });
    }
  }
});

export default router;
