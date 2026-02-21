import express, { Request, Response, Router } from "express";
import passport from "passport";
import { config, isProduction } from "../config/environmentConfig";
import { mockAuthMiddleware } from "../middleware/mockAuth";

const router = Router();

/**
 * GET /api/user
 * Returns the data of the current logged-in user
 * If none logged in, returns 401 Unauthorized
 */
router.get("/user", (req: Request, res: Response) => {
  if (req.isAuthenticated() && req.user) {
    return res.json(req.user);
  }

  res.status(401).json({ error: "Not authenticated" });
});

/**
 * GET /api/login
 *
 * DEVELOMPENT VERSION: Uses mock authentication middleware to log in a test user
 * PRODUCTION VERSION: Redirects to university login page
 */
if (isProduction) {
  router.get("/login", passport.authenticate("oidc"));
} else {
  router.get("/login", mockAuthMiddleware, (req: Request, res: Response) => {
    res.redirect(
      "https://hytis-ohtuprojekti-staging.ext.ocp-test-0.k8s.it.helsinki.fi",
    );
  });
}

/**
 * GET /api/login/callback
 *
 * OIDC callback route after university login
 * In the development version, this does nothing
 * because the mock authentication logs directly in on the /api/login route
 */
if (isProduction) {
  router.get(
    "/login/callback",
    passport.authenticate("oidc", {
      failureRedirect: "/",
      failureMessage: true,
    }) as express.RequestHandler,
    (req: Request, res: Response) => {
      res.redirect(config.frontendUrl || "/");
    },
  );
} else {
  router.get("/login/callback", (req: Request, res: Response) => {
    res.status(501).json({
      error: "Not implemented in development mode",
      message: "This route is only used with real OIDC authentication",
    });
  });
}

/**
 * POST /api/logout
 * Log out the current user and destroy the session
 */
router.post("/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destroy error:", destroyErr);
        return res.status(500).json({ error: "Session destroy failed" });
      }

      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
});

export default router;
