import type { InferAttributes, InferCreationAttributes } from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";
import { Person } from "./person";

class ResearchGroup extends Model<
  InferAttributes<ResearchGroup>,
  InferCreationAttributes<ResearchGroup>
> {
  declare id: number;
  declare name: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare people?: Person[];
}

ResearchGroup.init(
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
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: "researchGroup",
    tableName: "research_groups",
  },
);

export { ResearchGroup };
