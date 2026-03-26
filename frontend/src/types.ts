export interface Department {
  id: number;
  name: string;
}

export interface Title {
  name: string;
}

export interface ResearchGroup {
  id: number;
  name: string;
}

export interface PersonSupervisor {
  supervisorId: number;
  subordinateId: number;
}

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  department: Department;
  researchGroup: ResearchGroup;
  title: Title;
  supervisors: Person[];
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
