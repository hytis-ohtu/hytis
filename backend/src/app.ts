import cors from "cors";
import express from "express";
import { config, isProduction } from "./config/environmentConfig";
import { configurePassport } from "./config/oidcConfig";
import { configureSession } from "./config/sessionConfig";
import authRoutes from "./routes/authRoutes";
import roomsRouter from "./routes/roomsRouter";

const app = express();

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

  app.use("/api", authRoutes);

  app.use("/api/rooms", roomsRouter);

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

  
    app.use(express.static("build/dist"));
  
};

setUpApp().catch((err) => {
  console.error("Error setting up the app:", err);
  process.exit(1);
});

export default app;
