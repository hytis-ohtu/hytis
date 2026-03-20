import { Request, Response, Router } from "express";
import { Department, ResearchGroup, Title } from "../models";

const router = Router();

/**
 * GET /api/reference-data/departments
 * Returns a list of all departments with id and name
 */

router.get(
  "/departments",
  async (_req: Request, res: Response): Promise<Response> => {
    try {
      const departments = await Department.findAll({
        attributes: ["id", "name"],
      });
      return res.status(200).json(departments);
    } catch {
      return res.status(500).json({ error: "Failed to fetch departments" });
    }
  },
);

/**
 * GET /api/reference-data/titles
 * Returns a list of all titles with id and name
 */

router.get(
  "/titles",
  async (_req: Request, res: Response): Promise<Response> => {
    try {
      const titles = await Title.findAll({
        attributes: ["id", "name"],
      });
      return res.status(200).json(titles);
    } catch {
      return res.status(500).json({ error: "Failed to fetch titles" });
    }
  },
);

/**
 * GET /api/reference-data/research-groups
 * Returns a list of all research groups with id and name
 */

router.get(
  "/research-groups",
  async (_req: Request, res: Response): Promise<Response> => {
    try {
      const researchGroups = await ResearchGroup.findAll({
        attributes: ["id", "name"],
      });
      return res.status(200).json(researchGroups);
    } catch {
      return res.status(500).json({ error: "Failed to fetch research groups" });
    }
  },
);

export default router;
