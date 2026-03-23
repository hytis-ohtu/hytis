import { contracts } from "./data/contracts";
import { departments } from "./data/departments";
import { people } from "./data/people";
import { personSupervisors } from "./data/personSupervisors";
import { researchGroups } from "./data/researchGroups";
import { rooms } from "./data/rooms";
import { titles } from "./data/titles";
import { connectToDatabase, sequelize } from "./db";
import {
  Contract,
  Department,
  Person,
  PersonSupervisor,
  ResearchGroup,
  Room,
  Title,
} from "./models/index";

export const dropAllTables = async () => {
  console.log("Dropping tables...");
  await Contract.drop({ cascade: true });
  await PersonSupervisor.drop({ cascade: true });
  await Person.drop({ cascade: true });
  await Room.drop({ cascade: true });
  await Title.drop({ cascade: true });
  await Department.drop({ cascade: true });
  await ResearchGroup.drop({ cascade: true });
  console.log("Tables dropped!");
};

export const createAllTables = async () => {
  console.log("Creating tables...");
  await Department.sync();
  await Title.sync();
  await Room.sync();
  await ResearchGroup.sync();
  await Person.sync();
  await Contract.sync();
  await PersonSupervisor.sync();
  console.log("Tables created!");
};

export const seedData = async () => {
  console.log("Seeding data...");

  await Department.bulkCreate(departments);
  await Title.bulkCreate(titles);
  await Room.bulkCreate(rooms);
  await ResearchGroup.bulkCreate(researchGroups);
  await Person.bulkCreate(people);
  await Contract.bulkCreate(contracts);
  await PersonSupervisor.bulkCreate(personSupervisors);

  console.log("Data seeded successfully!");
};

const resetDatabase = async () => {
  await connectToDatabase();
  await dropAllTables();
  await createAllTables();
  await seedData();
  await sequelize.close();
  console.log("Connection closed!");
};

if (process.env.SEED_DB === "true") {
  resetDatabase().catch((error) => {
    console.error("Error during database reset:", error);
  });
}
