import assert from "assert";
import type { Contract } from "../src/models";
import type { ExpectedContract } from "../src/types/other";
import { mockDepartments, mockPeople, mockTitles } from "./mockData";

export const validateContract = (
  contract: Contract,
  expectedContract: ExpectedContract,
) => {
  const expectedPerson = mockPeople.find(
    (person) => person.id === expectedContract.personId,
  );
  const expectedDepartment = mockDepartments.find(
    (dept) => dept.id === expectedPerson?.departmentId,
  );
  const expectedTitle = mockTitles.find(
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

export const MOCK_USER = {
  id: "1",
  name: "Testi Käyttäjä",
  email: "testi@testi.fi",
  uid: "testi-käyttäjä",
};

export const FRONTEND_URL = "http://localhost:5173";
