import app from "./app";
import { config } from "./config/environmentConfig";
import { configurePassport } from "./config/oidcConfig";
import { connectToDatabase } from "./db";

const start = async () => {
  await connectToDatabase();
  await configurePassport();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Use HY login: ${process.env.USE_HY_LOGIN || "false"}`);
  });
};

void start();
