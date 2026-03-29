export interface Department {
  id: number;
  name: string;
}

export interface Title {
  id: number;
  name: string;
}

export interface researchGroup {
  id: number;
  name: string;
}

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  department: Department;
  title: Title;
  researchGroup: researchGroup;
  freeText: string | null;
}

export interface Contract {
  startDate: string;
  endDate: string;
  person: Person;
}

export interface Room {
  id: number;
  name: string;
  area: string;
  capacity: number;
  department: Department;
  contracts: Contract[];
  freeText: string;
  roomType: string;
}
