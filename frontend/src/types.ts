export interface Department {
  id: number;
  name: string;
}

export interface Title {
  id: number;
  name: string;
}

export interface RoomType {
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

export interface RoomType {
  id: number;
  name: string;
}

export interface Room {
  id: number;
  name: string;
  area: string | null;
  capacity: number | null;
  freeText: string | null;
  roomType: RoomType | null;
  department: Department | null;
  contracts: RoomContract[];
}

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  freeText?: string | null;
  researchGroup?: ResearchGroup | null;
  department?: Department | null;
  title?: Title | null;
  supervisors?: Person[];
  contracts?: PersonContract[];
}

export interface PersonSupervisor {
  supervisorId: number;
  subordinateId: number;
}

export interface Contract {
  id: number;
  startDate: string | null;
  endDate: string | null;
}

export interface RoomContract extends Contract {
  person: Person;
}

export interface PersonContract extends Contract {
  room: Room;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  uid?: string;
}

export interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  needsLogin: boolean;
  logout: () => Promise<void>;
  login: () => void;
}
