import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { PersonInput } from "../utils";
import toPersonInput from "../utils";

const validatePersonInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let personInput: PersonInput;
  try {
    personInput = toPersonInput(req.body);
    req.personInput = personInput;
    next();
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.issues.map((issue) => issue.message).join(", "),
      });
    }
    return res.status(500).json({ error: "Failed to parse person input" });
  }
};

export default validatePersonInput;
