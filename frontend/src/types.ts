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
  department?: Department | null;
  researchGroup?: ResearchGroup | null;
  title?: Title | null;
  supervisors?: Person[];
  freeText?: string | null;
}

export interface Contract {
  id: number;
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

export interface FieldProps {
  label: string;
  value: string | null | undefined;
}
