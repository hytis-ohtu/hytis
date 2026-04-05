import assert from "assert";
import type { Contract } from "../src/models";
import type { ExpectedContract } from "../src/types/other";
import {
  mockDepartments,
  mockPeople,
  mockPersonSupervisors,
  mockResearchGroups,
  mockTitles,
} from "./mockData";

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
  const expectedResearchGroup = mockResearchGroups.find(
    (group) => group.id === expectedPerson?.researchGroupId,
  );

  const expectedPersonSupervisors = mockPersonSupervisors.filter(
    (ps) => ps.subordinateId === expectedPerson?.id,
  );

  assert(expectedPerson, "expected person should be defined");

  expect(contract).toMatchObject({
    startDate: expectedContract.startDate.toISOString().slice(0, 10),
    endDate: expectedContract.endDate.toISOString().slice(0, 10),
    person: {
      firstName: expectedPerson.firstName,
      lastName: expectedPerson.lastName,
      department: { name: expectedDepartment?.name },
      researchGroup: { name: expectedResearchGroup?.name },
      title: { name: expectedTitle?.name },
      supervisors: expectedPersonSupervisors.map((ps) => {
        const supervisor = mockPeople.find((p) => p.id === ps.supervisorId);
        return {
          firstName: supervisor?.firstName,
          lastName: supervisor?.lastName,
        };
      }),
      freeText: expectedPerson.freeText,
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
