import "express-session";
import type { PersonInput } from "../utils";

declare global {
  /* eslint-disable @typescript-eslint/no-namespace */
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      uid: string;
    }

    interface Request {
      user?: User;
      personInput?: PersonInput;
      isAuthenticated(): boolean;
      login(user: User, done: (err: Error | null) => void): void;
      logout(done: (err: Error | null) => void): void;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    passport?: {
      user?: Express.User;
    };
  }
}

export {};
