import { Request, Response, Router } from "express";
import type { FindOptions, InferAttributes } from "sequelize";
import { Op } from "sequelize";
import { z } from "zod";
import { sequelize } from "../db";
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
  let personInput: PersonInput;

  try {
    personInput = toPersonInput(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.issues.map((issue) => issue.message).join(", "),
      });
    }
    return res.status(500).json({ error: "Failed to parse person input" });
  }

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
  } = personInput;

  try {
    const newPerson = await sequelize.transaction(async (t) => {
      const person = await Person.create({
        firstName,
        lastName,
        titleId,
        departmentId,
        researchGroupId,
        freeText,
      });

      if (roomId) {
        await Contract.create(
          {
            personId: person.id,
            roomId,
            startDate,
            endDate,
          },
          { transaction: t },
        );
      }

      if (supervisorIds && supervisorIds.length > 0) {
        // Validate that all supervisor IDs exist
        const supervisors = await Person.findAll({
          where: { id: supervisorIds },
          attributes: ["id"],
          transaction: t,
        });

        if (supervisors.length !== supervisorIds.length) {
          throw new Error("One or more supervisor IDs are invalid");
        }

        await PersonSupervisor.bulkCreate(
          supervisorIds.map((supervisorId: number) => ({
            supervisorId,
            subordinateId: person.id,
          })),
          { transaction: t },
        );
      }

      return person;
    });

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
    if (
      error instanceof Error &&
      error.message === "One or more supervisor IDs are invalid"
    ) {
      return res.status(400).json({ error: error.message });
    }

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
    let personInput: PersonInput;

    try {
      personInput = toPersonInput(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: error.issues.map((issue) => issue.message).join(", "),
        });
      }
      return res.status(500).json({ error: "Failed to parse person input" });
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
    } = personInput;

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
 * Fetches all people, or searches based on query parameter 'q' and 'type'
 * Supported types: personName (default), supervisorName, contractEndDate
 */
router.get("/", async (req: Request, res: Response) => {
  const { q, type } = req.query;

  try {
    const queryStr = q && typeof q === "string" ? q : undefined;

    if (queryStr && queryStr.length > 100) {
      return res.status(400).json({ error: "Query too long" });
    }

    const supervisorsInclude = {
      model: Person,
      as: "supervisors",
      through: { attributes: [] },
      where: {},
      required: false,
    };

    const contractsInclude = {
      model: Contract,
      as: "contracts",
      include: [{ model: Room, as: "room" }],
      where: {},
      required: false,
    };

    const sharedIncludes = [
      "department",
      "title",
      "researchGroup",
      contractsInclude,
    ];

    const nameSearchWhere = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${queryStr}%` } },
        { lastName: { [Op.iLike]: `%${queryStr}%` } },
        // Search by full name
        sequelize.where(
          sequelize.fn(
            "CONCAT",
            sequelize.col("person.first_name"),
            " ",
            sequelize.col("person.last_name"),
          ),
          Op.iLike,
          `%${queryStr}%`,
        ),
      ],
    };

    const findOptions: FindOptions<InferAttributes<Person>> = {
      include: [supervisorsInclude, ...sharedIncludes],
      order: [
        ["lastName", "ASC"],
        ["firstName", "ASC"],
      ],
    };

    if (queryStr) {
      switch (type) {
        case "supervisorName":
          const supervisorSearchOptions = {
            ...findOptions,
            where: nameSearchWhere,
            include: [
              ...sharedIncludes,
              {
                model: Person,
                as: "subordinates",
                through: { attributes: [] },
                required: true,
              },
            ],
          };

          const matchingSupervisors = await Person.findAll(
            supervisorSearchOptions,
          );

          if (matchingSupervisors.length === 1) {
            const subordinatesSearchOptions = {
              ...findOptions,
              include: [
                {
                  model: Person,
                  as: "supervisors",
                  through: { attributes: [] },
                  where: { id: matchingSupervisors[0].id },
                  required: true,
                },
                ...sharedIncludes,
              ],
            };

            const subordinates = await Person.findAll(
              subordinatesSearchOptions,
            );
            return res.json(subordinates);
          }

          return res.json(matchingSupervisors);

        case "contractEndDate":
          contractsInclude.where = {
            endDate: {
              [Op.lte]: queryStr,
            },
          };
          contractsInclude.required = true;
          break;

        case "personName":
        default:
          findOptions.where = nameSearchWhere;
          break;
      }
    }

    const people = await Person.findAll(findOptions);
    res.json(people);
  } catch (error) {
    console.error("Error fetching people:", error);
    res.status(500).json({ error: "Failed to fetch people" });
  }
});

export default router;
