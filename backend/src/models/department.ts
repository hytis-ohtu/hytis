import type { InferAttributes, InferCreationAttributes } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";
import { Person } from "./person";

class Department extends Model<
  InferAttributes<Department>,
  InferCreationAttributes<Department>
> {
  declare id: number;
  declare name: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare people?: Person[];
}

Department.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: "department",
  },
);

export { Department };
