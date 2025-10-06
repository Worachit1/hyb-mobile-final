import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG, API_TIMEOUT } from "../config/api";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  User,
} from "../types/api";

// Create axios instance for auth
const authClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Storage keys
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// Request interceptor to add token
authClient.interceptors.request.use(
  async (config) => {
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
    console.log("🔐 Auth Response:", response.status, response.config.url);
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
  // Login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await authClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Store token and user data
      if (response.data.success && response.data.token && response.data.user) {
        await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
        await AsyncStorage.setItem(
          USER_KEY,
          JSON.stringify(response.data.user)
        );
      }

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

  // Register
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await authClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      );

      // Store token and user data
      if (response.data.success && response.data.token && response.data.user) {
        await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
        await AsyncStorage.setItem(
          USER_KEY,
          JSON.stringify(response.data.user)
        );
      }

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

  // Get Profile
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
};

export default authClient;
