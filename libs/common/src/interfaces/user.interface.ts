export interface UserRecord {
  id: number;
  employeeId: number;
  username: string;
  email: string;
  password: string;
  role: string;
  flgActive: string;
}

export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AuthenticatedUser;
}
