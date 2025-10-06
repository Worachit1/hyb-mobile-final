import axios, { AxiosResponse } from "axios";
import { API_CONFIG, API_TIMEOUT } from "../config/api";
import {
  CreateUserRequest,
  ApiResponse,
  User,
  GetUsersResponse,
} from "../types/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
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
  (response: AxiosResponse) => {
    console.log("📥 API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("📥 Response Error:", error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// API functions
export const userAPI = {
  // Create new user
  createUser: async (
    userData: CreateUserRequest
  ): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.post<ApiResponse<User>>(
        API_CONFIG.ENDPOINTS.USERS.CREATE,
        userData
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

  // Get all users
  getUsers: async (
    page: number = 1,
    limit: number = 10
  ): Promise<GetUsersResponse> => {
    try {
      const response = await apiClient.get<GetUsersResponse>(
        `${API_CONFIG.ENDPOINTS.USERS.LIST}?page=${page}&limit=${limit}`
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

  // Get user by ID
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.get<ApiResponse<User>>(
        API_CONFIG.ENDPOINTS.USERS.GET_BY_ID(id)
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

};

export default apiClient;
