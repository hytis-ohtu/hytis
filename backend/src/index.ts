import app from "./app";

const PORT = 3000;

const start = async () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

void start();
