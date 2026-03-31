import express, { Express, NextFunction, Request, Response } from "express";
import session from "express-session";
import request from "supertest";
import "../src/types/express";

// Mock the environment config to disable HY login and provide a frontend URL
jest.mock("../src/config/environmentConfig", () => ({
  config: { frontendUrl: "http://localhost:5173" },
  useHyLogin: false,
}));

// Mock the OIDC config to provide a test logout URL
jest.mock("../src/middleware/mockAuth", () => ({
  mockAuthMiddleware: (req: Request, _res: Response, next: NextFunction) => {
    req.user = {
      id: "1",
      name: "Testi Käyttäjä",
      email: "testi@testi.fi",
      uid: "testi-käyttäjä",
    };
    next();
  },
}));

import authRouter from "../src/routes/authRouter";

// Helper function to build an Express app with the authRouter and customizable authentication behavior
function buildApp(isAuthenticated = false): Express {
  const app = express();
  app.use(express.json());
  app.use(
    session({ secret: "test-secret", resave: false, saveUninitialized: false }),
  );
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.isAuthenticated = (() => isAuthenticated) as typeof req.isAuthenticated;
    if (isAuthenticated)
      req.user = {
        id: "1",
        name: "Testi Käyttäjä",
        email: "testi@testi.fi",
        uid: "testi-käyttäjä",
      };
    req.logout = ((cb: (err?: Error) => void) => cb()) as typeof req.logout;
    req.session.destroy = ((cb: (err?: Error) => void) =>
      cb()) as typeof req.session.destroy;
    next();
  });
  app.use("/api", authRouter);
  return app;
}

describe("GET /api/user", () => {
  it("returns 401 when user is not logged in", async () => {
    const res = await request(buildApp(false)).get("/api/user");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Not authenticated" });
  });

  it("returns user when logged in", async () => {
    const res = await request(buildApp(true)).get("/api/user");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: "1" });
  });
});

describe("GET /api/login", () => {
  it("redirects to frontend after login", async () => {
    const res = await request(buildApp()).get("/api/login");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("http://localhost:5173");
  });
});

describe("GET /api/login/callback", () => {
  it("returns 501 in development mode", async () => {
    const res = await request(buildApp()).get("/api/login/callback");
    expect(res.status).toBe(501);
    expect(res.body.error).toMatch(/Not implemented/);
  });
});

describe("POST /api/logout", () => {
  it("logs out and returns a success message", async () => {
    const res = await request(buildApp(true)).post("/api/logout");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Logged out successfully" });
  });
});
