import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";
import { Room } from "./room";

class RoomType extends Model<
  InferAttributes<RoomType>,
  InferCreationAttributes<RoomType>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare rooms?: Room[];
}

RoomType.init(
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
    modelName: "roomType",
  },
);

export { RoomType };
