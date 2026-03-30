import express, { Express } from "express";
import session from "express-session";
import request from "supertest";

// Mock the environment config to enable HY login and provide a frontend URL
jest.mock("../src/config/environmentConfig", () => ({
  config: { frontendUrl: "http://localhost:5173" },
  useHyLogin: true,
}));

// Mock the OIDC config to provide a test logout URL
jest.mock("../src/config/oidcConfig", () => ({
  endSessionUrl: "https://login.helsinki.fi/test-logout",
}));

// Mock passport's authenticate function to simulate OIDC authentication behavior
jest.mock("passport", () => ({
  authenticate: jest.fn((_strategy: string, options?: any) => {
    return (_req: any, res: any, next: any) => {
      if (options?.failureRedirect) {
        next();
      } else {
        res.redirect("https://login.helsinki.fi/test-login");
      }
    };
  }),
}));

import authRouter from "../src/routes/authRouter";

// Define a type for the logout behavior to simulate different scenarios in tests
type LogoutBehavior = "success" | "logout-error" | "destroy-error";

// Helper function to build an Express app with the authRouter and customizable authentication/logout behavior
function buildApp(
  isAuthenticated = false,
  logoutBehavior: LogoutBehavior = "success",
): Express {
  const app = express();
  app.use(express.json());
  app.use(
    session({ secret: "test-secret", resave: false, saveUninitialized: false }),
  );
  app.use((req: any, _res, next) => {
    req.isAuthenticated = () => isAuthenticated;
    if (isAuthenticated)
      req.user = {
        id: 1,
        name: "Testi Käyttäjä",
        email: "testi@testi.fi",
        uid: "testi-käyttäjä",
      };

    req.logout = (cb: (err?: Error) => void) =>
      logoutBehavior === "logout-error" ? cb(new Error("logout error")) : cb();

    req.session.destroy = (cb: (err?: Error) => void) =>
      logoutBehavior === "destroy-error"
        ? cb(new Error("destroy error"))
        : cb();

    next();
  });
  app.use("/api", authRouter);
  return app;
}

describe("GET /api/login", () => {
  it("redirects to HY login page", async () => {
    const res = await request(buildApp()).get("/api/login");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("https://login.helsinki.fi/test-login");
  });
});

describe("GET /api/login/callback", () => {
  it("redirects to frontend after successful OIDC callback", async () => {
    const res = await request(buildApp()).get("/api/login/callback");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("http://localhost:5173");
  });
});

describe("POST /api/logout", () => {
  it("returns HY logout URL", async () => {
    const res = await request(buildApp(true)).post("/api/logout");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      logoutUrl: "https://login.helsinki.fi/test-logout",
    });
  });

  it("returns 500 if logout fails", async () => {
    const res = await request(buildApp(true, "logout-error")).post(
      "/api/logout",
    );
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Logout failed" });
  });

  it("returns 500 if session destroy fails", async () => {
    const res = await request(buildApp(true, "destroy-error")).post(
      "/api/logout",
    );
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Session destroy failed" });
  });
});
