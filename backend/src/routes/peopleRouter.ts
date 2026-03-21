import { Request, Response, Router } from "express";
import { z } from "zod";
import { Person, PersonSupervisor } from "../models";
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

      await person.reload({
        include: [
          { model: Person, as: "supervisors", through: { attributes: [] } },
        ],
      });

      return res.status(200).json(person);
    } catch (error) {
      console.error("Error updating person:", error);
      return res.status(500).json({ error: "Failed to update person" });
    }
  },
);

export default router;
