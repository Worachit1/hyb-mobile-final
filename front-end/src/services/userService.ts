import axios from "axios";
import { API_CONFIG, API_TIMEOUT } from "../config/api";
import { ApiResponse } from "../types/api";

// Create axios instance for class API calls
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_CONFIG.API_KEY,
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log("📤 API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("📤 Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("📥 Response Error:", error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// Student data interface
interface Student {
  id: string;
  name: string;
  studentId: string;
  year: string;
  // เพิ่ม fields อื่นๆ ตามที่ API ส่งมา
}

// Class API functions
export const classAPI = {
  // ดึงรายชื่อนักเรียนตามปีการศึกษา
  getStudentsByYear: async (year: string): Promise<ApiResponse<Student[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<Student[]>>(
        API_CONFIG.ENDPOINTS.CLASS.GET_STUDENTS(year)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw {
        success: false,
        message: "Network error occurred",
        error: error.message,
      };
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: "Health check failed",
        error: error.message,
      };
    }
  },
};

export default apiClient;
