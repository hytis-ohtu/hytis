import app from "./app";
import { config } from "./config/environmentConfig";
import { connectToDatabase } from "./db";

const start = async () => {
  await connectToDatabase();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

void start();
