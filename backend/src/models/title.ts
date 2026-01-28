import type { InferAttributes, InferCreationAttributes } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";
import { Person } from "./person";

class Title extends Model<
  InferAttributes<Title>,
  InferCreationAttributes<Title>
> {
  declare id: number;
  declare name: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare people?: Person[];
}

Title.init(
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
    modelName: "title",
  },
);

export { Title };
