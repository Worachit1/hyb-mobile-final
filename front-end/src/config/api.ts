// Network Configuration for Expo Development
// สำหรับ Expo development server ใช้ network IP address
// API Configuration
export const API_CONFIG = {
  // สำหรับ Expo development - ใช้ network IP address แทน localhost
  BASE_URL: "http://10.243.8.76:5000/api",

  ENDPOINTS: {
    USERS: {
      CREATE: "/users/create",
      LIST: "/users/list",
      GET_BY_ID: (id: string) => `/users/${id}`,
    },
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      PROFILE: "/auth/profile",
    },
    HEALTH: "/health",
  },
};

export const API_TIMEOUT = 10000; // 10 seconds
