import { Request, Response, Router } from "express";
import { Op } from "sequelize";
import { z } from "zod";
import { Contract, Person, PersonSupervisor, Room } from "../models";
import type { PersonInput } from "../utils";
import toPersonInput from "../utils";

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
        return res
          .status(400)
          .json({ error: "One or more supervisor IDs are invalid" });
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
 * PUT /api/people/:id
 * Updates a person with the provided first name and last name
 * Optionally, titleId, departmentId, researchGroupId, freeText and supervisorIds can be updated
 */
router.put(
  "/:id",
  async (
    req: Request<{ id: string }, Person | { error: string }, PersonInput>,
    res: Response<Person | { error: string }>,
  ): Promise<Response<Person | { error: string }>> => {
    const personId = req.params.id;

    try {
      toPersonInput(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: error.issues.map((issue) => issue.message).join(", "),
        });
      }
    }

    const {
      firstName,
      lastName,
      titleId,
      departmentId,
      researchGroupId,
      freeText,
      supervisorIds,
      startDate,
      endDate,
      roomId,
    } = req.body;

    try {
      const person = await Person.findByPk(Number(personId));

      if (!person) {
        return res.status(404).json({ error: "Person not found" });
      }

      await person.update({
        firstName,
        lastName,
        titleId,
        departmentId,
        researchGroupId,
        freeText,
      });

      if (supervisorIds !== undefined) {
        await PersonSupervisor.destroy({ where: { subordinateId: personId } });

        if (supervisorIds.length > 0) {
          await PersonSupervisor.bulkCreate(
            supervisorIds.map((supervisorId: number) => ({
              supervisorId,
              subordinateId: Number(personId),
            })),
          );
        }
      }

      if (roomId !== undefined) {
        const existingContract = await Contract.findOne({
          where: { personId: Number(personId), roomId: Number(roomId) },
        });

        if (existingContract) {
          await existingContract.update({
            startDate:
              startDate !== undefined ? startDate : existingContract.startDate,
            endDate: endDate !== undefined ? endDate : existingContract.endDate,
          });
        } else {
          await Contract.create({
            personId: Number(personId),
            roomId: Number(roomId),
            startDate: startDate ?? null,
            endDate: endDate ?? null,
          });
        }
      }

      await person.reload({
        include: [
          { model: Person, as: "supervisors", through: { attributes: [] } },
          {
            model: Contract,
            as: "contracts",
            include: [{ model: Room, as: "room" }],
          },
        ],
      });

      return res.status(200).json(person);
    } catch (error) {
      console.error("Error updating person:", error);
      return res.status(500).json({ error: "Failed to update person" });
    }
  },
);

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
