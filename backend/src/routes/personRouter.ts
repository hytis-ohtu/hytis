import { Request, Response, Router } from "express";
import { Person, PersonSupervisor } from "../models";

const router = Router();

/**
 * POST /api/persons
 * Creates a new person with the provided first name, last name, title and department id, and free text
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

export default router;
