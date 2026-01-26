import app from "./app";
import { connectToDatabase } from "./db";

const PORT = 3000;

const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

void start();
