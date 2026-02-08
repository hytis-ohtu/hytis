import { NextFunction, Request, Response } from "express";

/**
 * Mock authentication middleware - ONLY FOR DEVELOPMENT PURPOSES!
 *
 * This middleware automatically creates a temporary user
 * in a development environment, so that authentication can be tested
 * without real university login configuration.
 *
 * ⚠️ DO NOT USE IN PRODUCTION ENVIRONMENT! ⚠️
 */

interface MockUser {
  id: string;
  name: string;
  email: string;
  uid: string;
}

export const mockAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV === "production") {
    return next();
  }

  if (req.isAuthenticated()) {
    return next();
  }

  const mockUser: MockUser = {
    id: "12345",
    name: "Terppa Testaaja",
    email: "terppa.testaaja@helsinki.fi",
    uid: "terppa-testaaja",
  };

  req.login(mockUser, (err) => {
    if (err) {
      console.error("Mock login failed:", err);
      return next(err);
    }
    console.log("Mock user logged in:", mockUser.name);
    next();
  });
};
