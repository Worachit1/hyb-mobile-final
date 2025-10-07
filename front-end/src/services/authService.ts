import axios from "axios";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG, API_TIMEOUT } from "../config/api";
import { LoginRequest, AuthResponse, ApiResponse, User } from "../types/api";

// Create axios instance for auth
const authClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_CONFIG.API_KEY, // User ระบุผ่าน API key
  },
});

// Storage keys
const TOKEN_KEY = "userToken";
const USER_KEY = "userData";

// Request interceptor
authClient.interceptors.request.use(
  async (config) => {
    // เพิ่ม token หาก signin แล้ว
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("🔐 Auth Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("🔐 Auth Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
authClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error(
      "🔐 Auth Response Error:",
      error.response?.status,
      error.message
    );

    // If token is invalid or expired, clear storage
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  // Sign In
  signin: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await authClient.post<any>(
        API_CONFIG.ENDPOINTS.AUTH.SIGNIN,
        credentials
      );


      // ตรวจสอบรูปแบบ response ที่แท้จริง
      const responseData = response.data;

      // กรณีที่ server ส่ง data ใน responseData.data
      if (responseData && responseData.data) {
        const userData = responseData.data;

        console.log("🔐 Checking userData:", {
          hasToken: !!userData.token,
          tokenLength: userData.token ? userData.token.length : 0,
          hasId: !!(userData._id || userData.id),
          userId: userData._id || userData.id,
        });

        // ตรวจสอบว่ามี token และข้อมูล user
        if (userData.token && (userData._id || userData.id)) {
          // เก็บ token
          await AsyncStorage.setItem(TOKEN_KEY, userData.token);
          console.log(
            "🔐 Token saved to storage:",
            userData.token.length,
            "characters"
          );

          // สร้าง user object ที่สอดคล้องกับ interface
          const userObject = {
            id: userData._id || userData.id,
            name:
              `${userData.firstname || ""} ${userData.lastname || ""}`.trim() ||
              userData.email,
            firstname: userData.firstname,
            lastname: userData.lastname,
            email: userData.email,
            role: userData.role,
            type: userData.type,
            education: userData.education,
          };

          // เก็บ user data
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(userObject));
          console.log("🔐 User data saved to storage:", userObject.name);

          return {
            success: true,
            message: "Sign in successful",
            user: {
              id: userObject.id,
              name: userObject.name,
              firstname: userData.firstname,
              lastname: userData.lastname,
              email: userData.email,
            },
            token: userData.token,
          };
        }
      }

      // ถ้าไม่ตรงเงื่อนไขไหนเลย
      console.log("🔐 No token or user data found in response");
      return {
        success: false,
        message: "Invalid response: missing token or user data",
      };
    } catch (error: any) {
      console.error("🔐 Signin error:", error);
      if (error.response?.data) {
        console.log(
          "🔐 Error response data:",
          JSON.stringify(error.response.data, null, 2)
        );

        // ตรวจสอบว่า error response มี message หรือไม่
        const errorData = error.response.data;
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `Authentication failed (${error.response.status})`;

        return {
          success: false,
          message: errorMessage,
        };
      }

      return {
        success: false,
        message: "Network error occurred",
        error: error.message,
      };
    }
  },

  // Get Profile - ดึงข้อมูล user profile จาก x-api-key
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await authClient.get<ApiResponse<User>>(
        API_CONFIG.ENDPOINTS.AUTH.PROFILE
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

  // Logout
  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },

  // Get stored token
  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  // Get stored user
  getStoredUser: async (): Promise<User | null> => {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  },

  // Check if user is logged in
  isLoggedIn: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  // Check if API key is valid
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const response = await authAPI.getProfile();
      return response.success;
    } catch (error: any) {
      console.log(
        "🔐 API Key validation failed:",
        error.response?.status || error.message
      );
      // 401 หมายถึง API key ไม่ถูกต้องหรือไม่มีสิทธิ์
      if (error.response?.status === 401) {
        console.log("🔐 Invalid API key or unauthorized access");
      }
      return false;
    }
  },
};

export default authClient;
