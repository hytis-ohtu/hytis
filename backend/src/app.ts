import cors from "cors";
import express from "express";
import { config, isProduction, useHyLogin } from "./config/environmentConfig";
import { configurePassport } from "./config/oidcConfig";
import { configureSession } from "./config/sessionConfig";
import authRouter from "./routes/authRouter";
import peopleRouter from "./routes/peopleRouter";
import roomsRouter from "./routes/roomsRouter";
import testingRouter from "./routes/testingRouter";

const app = express();

if (useHyLogin) {
  app.set("trust proxy", 1);
}

if (isProduction && !config.frontendUrl) {
  throw new Error("FRONTEND_URL required in production");
}

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const setUpApp = async () => {
  await configureSession(app);
  await configurePassport();

  app.use("/api", authRouter);

  app.use("/api/rooms", roomsRouter);

  app.use("/api/people", peopleRouter);

  app.get("/ping", (_req, res) => {
    console.log("someone pinged here");
    res.send("pong");
  });

  // Test route to check server health
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      redis: isProduction ? "enabled" : "disabled",
    });
  });

  if (!isProduction) {
    app.use("/api/testing", testingRouter);
  }

  if (isProduction) {
    app.use(express.static("build/dist"));
  }
};

setUpApp().catch((err) => {
  console.error("Error setting up the app:", err);
  process.exit(1);
});

export default app;
