import { Request, Response, Router } from "express";
import { Contract } from "../models";

const router = Router();

/**
 * DELETE /api/contracts/:id
 * Deletes a contract between a person and a room
 * Returns 204 No Content on success
 * Returns 404 if contract not found
 */
router.delete(
  "/:id",
  async (
    req: Request<{ id: string }>,
    res: Response<{ error: string }>,
  ): Promise<Response<{ error: string }>> => {
    try {
      const { id } = req.params;

      const contract = await Contract.findByPk(Number(id));

      if (!contract) {
        return res.status(404).json({
          error: "Contract not found",
        });
      }

      await contract.destroy();

      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting contract:", error);
      return res.status(500).json({
        error: "Failed to delete contract",
      });
    }
  },
);

export default router;
