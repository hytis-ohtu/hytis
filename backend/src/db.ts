import { Sequelize } from "sequelize";
import { DATABASE_URL } from "./config/environmentConfig";

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export { connectToDatabase, sequelize };
