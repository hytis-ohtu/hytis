import { Contract } from "./contract";
import { Department } from "./department";
import { Person } from "./person";
import { Room } from "./room";
import { Title } from "./title";

Department.hasMany(Person, { foreignKey: "departmentId", as: "people" });
Person.belongsTo(Department, { foreignKey: "departmentId", as: "department" });

Title.hasMany(Person, { foreignKey: "titleId", as: "people" });
Person.belongsTo(Title, { foreignKey: "titleId", as: "title" });

Person.hasMany(Contract, { foreignKey: "personId", as: "contracts" });
Contract.belongsTo(Person, { foreignKey: "personId", as: "person" });

Room.hasMany(Contract, { foreignKey: "roomId", as: "contracts" });
Contract.belongsTo(Room, { foreignKey: "roomId", as: "room" });

export { Contract, Department, Person, Room, Title };
