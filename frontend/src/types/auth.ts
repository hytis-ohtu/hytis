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
