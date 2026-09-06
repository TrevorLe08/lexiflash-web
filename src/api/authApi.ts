import { axiosClient } from "./axiosClient";
import { User, UserProfile, ApiResponse } from "../types";

export const authApi = {
  register: (data: {
    email: string;
    username: string;
    password: string;
    name: string;
  }): Promise<
    ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
  > => {
    return axiosClient.post("/auth/register", data);
  },

  login: (data: {
    loginIdentifier: string;
    password: string;
  }): Promise<
    ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
  > => {
    return axiosClient.post("/auth/login", data);
  },

  adminLogin: (data: {
    loginIdentifier: string;
    password: string;
  }): Promise<
    ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
  > => {
    return axiosClient.post("/auth/admin-login", data);
  },

  refreshToken: (
    refreshToken: string,
  ): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    return axiosClient.post("/auth/refresh-token", { refreshToken });
  },

  logout: (refreshToken?: string): Promise<ApiResponse<null>> => {
    return axiosClient.post("/auth/logout", { refreshToken });
  },

  getMe: (): Promise<ApiResponse<UserProfile>> => {
    return axiosClient.get("/users/me");
  },

  getUserProfile: (
    userIdOrUsername: string,
  ): Promise<ApiResponse<UserProfile>> => {
    return axiosClient.get(`/users/${encodeURIComponent(userIdOrUsername)}`);
  },

  updateProfile: (data: {
    name?: string;
    avatarUrl?: string;
    bio?: string;
  }): Promise<ApiResponse<UserProfile>> => {
    return axiosClient.put("/users/me", data);
  },

  getStats: (): Promise<ApiResponse<any>> => {
    return axiosClient.get("/users/stats");
  },

  forgotPassword: (email: string): Promise<ApiResponse<null>> => {
    return axiosClient.post("/auth/forgot-password", { email });
  },

  resetPassword: (data: {
    token: string;
    email: string;
    newPassword: string;
  }): Promise<ApiResponse<null>> => {
    return axiosClient.post("/auth/reset-password", data);
  },

  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<null>> => {
    return axiosClient.post("/auth/change-password", data);
  },

  changeEmail: (data: {
    newEmail: string;
    password: string;
  }): Promise<ApiResponse<UserProfile>> => {
    return axiosClient.put("/users/change-email", data);
  },
};
