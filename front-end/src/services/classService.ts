import axios from "axios";
import { API_CONFIG, API_TIMEOUT, createAPIInstance } from "../config/api";
import { ApiResponse, Student } from "../types/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create API instance with auth headers
const api = createAPIInstance();

export interface ClassAPIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Class API functions
export const classAPI = {
  // ดึงรายชื่อนักเรียนตามปีการศึกษา (ปี พ.ศ.)
  getStudentsByYear: async (
    buddhistYear: string
  ): Promise<ClassAPIResponse<Student[]>> => {
    try {
      console.log(`📚 Getting students for year: ${buddhistYear}`);

      // Debug: ตรวจสอบ token ก่อนเรียก API
      const token = await AsyncStorage.getItem("userToken");
      console.log(`📚 Token available: ${token ? "Yes" : "No"}`);
      if (token) {
        console.log(`📚 Token length: ${token.length}`);
      }

      const response = await api.get(
        API_CONFIG.ENDPOINTS.CLASS.GET_STUDENTS(buddhistYear)
      );

      // ตรวจสอบ response structure
      if (response.data) {
        let students: Student[] = [];

        // กรณีที่ข้อมูลอยู่ใน response.data.data (nested structure)
        if (response.data.data && Array.isArray(response.data.data)) {
          students = response.data.data;
        }
        // กรณีที่ข้อมูลอยู่ใน response.data โดยตรง
        else if (Array.isArray(response.data)) {
          students = response.data;
        }
        // กรณีที่เป็น object ที่มี students property
        else if (
          response.data.students &&
          Array.isArray(response.data.students)
        ) {
          students = response.data.students;
        }


        return {
          success: true,
          data: students,
          message: `พบนักเรียน ${students.length} คน สำหรับปี ${buddhistYear}`,
        };
      }

      return {
        success: false,
        data: [],
        message: "ไม่พบข้อมูลนักเรียน",
      };
    } catch (error: any) {
      console.error("📚 Class service error:", error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;

        console.log(`📚 Error status: ${status}, message: ${message}`);

        if (status === 401) {
          // ลองลบ token และแจ้งให้ผู้ใช้ signin ใหม่
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userData");

          return {
            success: false,
            data: [],
            message: "ต้องเข้าสู่ระบบใหม่ กรุณาออกจากแอปและเข้าสู่ระบบอีกครั้ง",
          };
        } else if (status === 404) {
          return {
            success: false,
            data: [],
            message: `ไม่พบข้อมูลนักเรียนสำหรับปี ${buddhistYear}`,
          };
        } else {
          return {
            success: false,
            data: [],
            message: `เกิดข้อผิดพลาด: ${message}`,
          };
        }
      }

      return {
        success: false,
        data: [],
        message:
          "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
      };
    }
  },

  // ดึงรายชื่อนักเรียนปีปัจจุบัน
  getCurrentYearStudents: async (): Promise<ClassAPIResponse<Student[]>> => {
    // คำนวณปี พ.ศ. ปัจจุบัน
    const currentBuddhistYear = (new Date().getFullYear() + 543).toString();
    return classAPI.getStudentsByYear(currentBuddhistYear);
  },
};
