import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL || "";

export default {
  DATABASE_URL,
};
