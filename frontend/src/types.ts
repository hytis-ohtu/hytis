export interface Department {
  name: string;
}

export interface Title {
  name: string;
}

export interface Person {
  firstName: string;
  lastName: string;
  department: Department;
  title: Title;
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
  contracts: Contract[];
}
