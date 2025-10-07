import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Network Configuration for Expo Development
// สำหรับ Expo development server ใช้ network IP address
// API Configuration
export const API_CONFIG = {
  // สำหรับ Expo development - ใช้ network IP address แทน localhost
  BASE_URL: "https://cis.kku.ac.th/api/classroom",

  // API Key สำหรับ authentication - ระบุ user ผ่าน key นี้
  API_KEY: "37e47fc585dc9688d64ab8c23741296349fa32b1b745b5fd8b26ef4de4c65ebb",

  ENDPOINTS: {
    AUTH: {
      SIGNIN: "/signin", // สำหรับ login
      PROFILE: "/profile", // ดึงข้อมูล user profile จาก x-api-key
    },
    CLASS: {
      GET_STUDENTS: (year: string) => `/class/${year}`, // ดึงรายชื่อนักเรียนตามปี
    },
    HEALTH: "/health",
  },
};

export const API_TIMEOUT = 10000; // 10 seconds

// Create API instance with auth headers
export const createAPIInstance = () => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_CONFIG.API_KEY,
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Debug: แสดง headers ที่จะส่ง
        console.log("🌐 API Request:", {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: {
            "x-api-key": config.headers["x-api-key"] ? "Present" : "Missing",
            Authorization: config.headers.Authorization
              ? "Bearer ***"
              : "Missing",
            "Content-Type": config.headers["Content-Type"],
          },
        });
      } catch (error) {
        console.log("Error getting token from storage:", error);
      }
      return config;
    },
    (error) => {
      console.error("🌐 Request Error:", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for debugging
  instance.interceptors.response.use(
    (response) => {
      console.log("🌐 API Response:", {
        status: response.status,
        url: response.config.url,
        dataType: typeof response.data,
        hasData: !!response.data,
      });
      return response;
    },
    (error) => {
      console.error("🌐 API Error:", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
      return Promise.reject(error);
    }
  );

  return instance;
};
