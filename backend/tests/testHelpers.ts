import assert from "assert";
import { departments } from "../src/data/departments";
import { people } from "../src/data/people";
import { titles } from "../src/data/titles";
import type { Contract } from "../src/models";
import type { ExpectedContract } from "../src/types/other";

export const validateContract = (
  contract: Contract,
  expectedContract: ExpectedContract,
) => {
  const expectedPerson = people.find(
    (person) => person.id === expectedContract.personId,
  );
  const expectedDepartment = departments.find(
    (dept) => dept.id === expectedPerson?.departmentId,
  );
  const expectedTitle = titles.find(
    (title) => title.id === expectedPerson?.titleId,
  );

  assert(expectedPerson, "expected person should be defined");
  assert(expectedDepartment, "expected department should be defined");
  assert(expectedTitle, "expected title should be defined");

  expect(contract).toMatchObject({
    startDate: expectedContract.startDate.toISOString().slice(0, 10),
    endDate: expectedContract.endDate.toISOString().slice(0, 10),
    person: {
      firstName: expectedPerson.firstName,
      lastName: expectedPerson.lastName,
      department: { name: expectedDepartment.name },
      title: { name: expectedTitle.name },
    },
  });
};
