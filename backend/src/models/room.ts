import type { InferAttributes, InferCreationAttributes } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";
import { Contract } from "./contract";

class Room extends Model<InferAttributes<Room>, InferCreationAttributes<Room>> {
  declare id: number;
  declare name: string;
  declare area: number | null;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare contracts?: Contract[];
}

Room.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    area: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: "room",
  },
);

export { Room };
