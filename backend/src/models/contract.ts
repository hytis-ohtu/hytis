import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";
import { Person } from "./person";

class Contract extends Model<
  InferAttributes<Contract>,
  InferCreationAttributes<Contract>
> {
  declare id: CreationOptional<number>;
  declare personId: number;
  declare roomId: number;
  declare startDate: Date;
  declare endDate: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare person?: Person;
}

Contract.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    personId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "people",
        key: "id",
      },
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "rooms",
        key: "id",
      },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: "contract",
  },
);

export { Contract };
