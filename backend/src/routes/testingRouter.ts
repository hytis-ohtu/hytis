import { Request, Response, Router } from "express";
import { createAllTables, dropAllTables, seedData } from "../seed";

const router = Router();

/**
 * POST /api/testing/reset
 * Resets and seeds the database
 */
router.post(
  "/reset",
  async (
    _req: Request,
    res: Response,
  ): Promise<Response<{ message: string }>> => {
    await dropAllTables();
    await createAllTables();
    await seedData();

    return res.status(200).json({ message: "Database reset successfully." });
  },
);

export default router;
