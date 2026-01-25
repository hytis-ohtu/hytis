import cors from "cors";
import express from "express";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/ping", (_req, res) => {
  console.log("someone pinged here");
  res.send("pong");
});

export default app;
