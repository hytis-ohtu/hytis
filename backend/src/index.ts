import app from "./app";
import { connectToDatabase } from "./db";

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

void start();
