export interface User {
  id: number;
  employeeId: number;
  username: string;
  email: string;
  password: string;
  role: string;
  flgActive: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface ListUser {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  username: string;
  email: string;
  role: string;
  flgActive: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}
