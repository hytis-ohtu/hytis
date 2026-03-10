import type { InferAttributes, InferCreationAttributes } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";

class PersonSupervisor extends Model<
  InferAttributes<PersonSupervisor>,
  InferCreationAttributes<PersonSupervisor>
> {
  declare subordinateId: number;
  declare supervisorId: number;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

PersonSupervisor.init(
  {
    subordinateId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "people",
        key: "id",
      },
    },
    supervisorId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "people",
        key: "id",
      },
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: "personSupervisor",
    tableName: "person_supervisors",
  },
);

export { PersonSupervisor };
