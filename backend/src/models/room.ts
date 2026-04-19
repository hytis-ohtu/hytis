import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";
import { Contract } from "./contract";
import { Department } from "./department";

class Room extends Model<InferAttributes<Room>, InferCreationAttributes<Room>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare area: number | null;
  declare capacity: number | null;
  declare departmentId: number | null;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare department?: Department;
  declare contracts?: Contract[];
  declare freeText?: string | null;
  declare roomTypeId: number | null;
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
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
    },
    freeText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    roomTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "room_types",
        key: "id",
      },
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
