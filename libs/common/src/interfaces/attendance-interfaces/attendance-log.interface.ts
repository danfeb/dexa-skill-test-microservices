export interface AttendanceLog {
  id: number;
  userId: number;
  employeeId: number;
  workType: string;
  attachment: string;
  attendanceDatetime: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface AttendanceLogList {
  id: number;
  userId: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  email: string;
  workType: string;
  attachment: string;
  attendanceDatetime: string;
  description: string;
}
