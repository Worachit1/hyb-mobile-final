export interface User {
  _id?: string;
  id?: string;
  name: string;
  firstname?: string;
  lastname?: string;
  email: string;
  department?: string;
  role?: string;
  type?: string; // student, teacher, etc.
  confirmed?: boolean;
  education?: {
    major?: string;
    enrollmentYear?: string;
    studentId?: string;
    schoolId?: string | null;
    schoolProvince?: string | null;
    advisorId?: string | null;
    _id?: string;
  };
  image?: string;
  job?: any[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Student interface สำหรับข้อมูลนักเรียน
export interface Student {
  id?: string;
  _id?: string;
  name?: string;
  firstname?: string;
  lastname?: string;
  studentId?: string;
  year?: string;
  email?: string;
  department?: string;
  class?: string;
  role?: string;
  type?: string;
  education?: {
    major?: string;
    enrollmentYear?: string;
    studentId?: string;
    schoolId?: string | null;
    schoolProvince?: string | null;
    advisorId?: string | null;
    _id?: string;
  };
  // เพิ่ม fields อื่นๆ ตามที่ API ส่งมา
  [key: string]: any;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    firstname?: string;
    lastname?: string;
    email: string;
  };
  token?: string;
  error?: string; // เพิ่ม error field
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  error?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Class/Student responses
export interface GetStudentsResponse {
  success: boolean;
  message: string;
  data: Student[];
  pagination?: PaginationInfo;
}
