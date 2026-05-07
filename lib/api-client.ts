import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://pgmaster-backend-production.up.railway.app/api/v1";

// Create axios instance
const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================
// REQUEST INTERCEPTOR
// ==========================
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");

    const isAuthRoute =
      config.url?.includes("/auth/login/") ||
      config.url?.includes("/auth/register/") ||
      config.url?.includes("/auth/google-login/") ||
      config.url?.includes("/auth/token/refresh/");

    if (token && !isAuthRoute) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  return config;
});

// ==========================
// RESPONSE INTERCEPTOR
// ==========================
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (typeof window !== "undefined") {
      const originalRequest: any = error.config;

      // Handle 401 (token expired)
      if (
        error.response?.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refresh_token");

          if (!refreshToken) {
            throw new Error("No refresh token");
          }

          const response = await axios.post(
            `${API_URL}/auth/token/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          const newAccessToken = (response.data as any).access;

          // Save new token
          localStorage.setItem("access_token", newAccessToken);

          // Update header and retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return client.request(originalRequest);
        } catch (err) {
          // Token refresh failed → logout
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default client;
