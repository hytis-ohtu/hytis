import { contracts } from "../src/data/contracts";
import { departments } from "../src/data/departments";
import { people } from "../src/data/people";
import { personSupervisors } from "../src/data/personSupervisors";
import { researchGroups } from "../src/data/researchGroups";
import { rooms } from "../src/data/rooms";
import { titles } from "../src/data/titles";

export const mockPeople = people.map((person, index) => ({
  ...person,
  id: index + 1,
}));

export const mockDepartments = departments.map((dept, index) => ({
  ...dept,
  id: index + 1,
}));

export const mockTitles = titles.map((title, index) => ({
  ...title,
  id: index + 1,
}));

export const mockResearchGroups = researchGroups.map((group, index) => ({
  ...group,
  id: index + 1,
}));

export const mockPersonSupervisors = personSupervisors.map((ps, index) => ({
  ...ps,
  id: index + 1,
}));

export const mockContracts = contracts.slice(0, 3).map((contract, index) => ({
  ...contract,
  id: index + 1,
}));

export const mockRoom = { ...rooms[0], id: 1 };
