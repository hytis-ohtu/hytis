import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";
import { Contract } from "./contract";
import { Department } from "./department";
import { ResearchGroup } from "./researchGroup";
import { Title } from "./title";

class Person extends Model<
  InferAttributes<Person>,
  InferCreationAttributes<Person>
> {
  declare id: CreationOptional<number>;
  declare firstName: string;
  declare lastName: string;
  declare freeText: string | null;
  declare titleId: number | null;
  declare departmentId: number | null;
  declare researchGroupId: number | null;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare contracts?: Contract[];
  declare department?: Department;
  declare title?: Title;
  declare researchGroup?: ResearchGroup;
  declare supervisors?: Person[];
  declare subordinates?: Person[];
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
    researchGroupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "research_groups",
        key: "id",
      },
    },
    freeText: {
      type: DataTypes.TEXT,
      allowNull: true,
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
