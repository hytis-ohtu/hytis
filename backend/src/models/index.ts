import { Contract } from "./contract";
import { Department } from "./department";
import { Person } from "./person";
import { PersonSupervisor } from "./personSupervisor";
import { ResearchGroup } from "./researchGroup";
import { Room } from "./room";
import { RoomType } from "./roomType";
import { Title } from "./title";

Department.hasMany(Person, { foreignKey: "departmentId", as: "people" });
Person.belongsTo(Department, { foreignKey: "departmentId", as: "department" });

Department.hasMany(Room, { foreignKey: "departmentId", as: "rooms" });
Room.belongsTo(Department, { foreignKey: "departmentId", as: "department" });

Title.hasMany(Person, { foreignKey: "titleId", as: "people" });
Person.belongsTo(Title, { foreignKey: "titleId", as: "title" });

Person.hasMany(Contract, { foreignKey: "personId", as: "contracts" });
Contract.belongsTo(Person, { foreignKey: "personId", as: "person" });

Room.hasMany(Contract, { foreignKey: "roomId", as: "contracts" });
Contract.belongsTo(Room, { foreignKey: "roomId", as: "room" });

RoomType.hasMany(Room, { foreignKey: "roomTypeId", as: "rooms" });
Room.belongsTo(RoomType, { foreignKey: "roomTypeId", as: "roomType" });

ResearchGroup.hasMany(Person, { foreignKey: "researchGroupId", as: "people" });
Person.belongsTo(ResearchGroup, {
  foreignKey: "researchGroupId",
  as: "researchGroup",
});

Person.belongsToMany(Person, {
  through: PersonSupervisor,
  as: "supervisors",
  foreignKey: "subordinateId",
  otherKey: "supervisorId",
});
Person.belongsToMany(Person, {
  through: PersonSupervisor,
  as: "subordinates",
  foreignKey: "supervisorId",
  otherKey: "subordinateId",
});

export {
  Contract,
  Department,
  Person,
  PersonSupervisor,
  ResearchGroup,
  Room,
  RoomType,
  Title,
};
