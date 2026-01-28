import type { InferAttributes, InferCreationAttributes } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";
import { Contract } from "./contract";

class Person extends Model<
  InferAttributes<Person>,
  InferCreationAttributes<Person>
> {
  declare id: number;
  declare firstName: string;
  declare lastName: string;
  declare titleId: number | null;
  declare departmentId: number | null;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare contracts?: Contract[];
}

Person.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    titleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "titles",
        key: "id",
      },
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: "person",
  },
);

export { Person };
