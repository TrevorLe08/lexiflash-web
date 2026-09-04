import { axiosClient } from "./axiosClient";
import {
  ApiResponse,
  PaginatedResult,
  UserRole,
  PrivacyLevel,
  StudySet,
  ClassGroup,
} from "../types";

export interface AdminOverviewStats {
  users: {
    totalUsers: number;
    adminCount: number;
    userCount: number;
    vipCount: number;
    vipGoldCount?: number;
    vipDiamondCount?: number;
    bannedCount: number;
    activeTodayCount: number;
    activeStreakCount: number;
  };
  content: {
    totalStudySets: number;
    publicSets: number;
    privateSets: number;
    featuredSets: number;
    totalCards: number;
    totalFolders: number;
    totalStudyGroups: number;
  };
  activity: {
    totalStudySessions: number;
    modeDistribution: Record<string, { count: number; percentage: number }>;
    totalTestsTaken: number;
    averageTestScore: number;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    username: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    createdAt: string;
  }>;
  recentSets: Array<{
    id: string;
    title: string;
    creatorName: string;
    cardCount: number;
    privacy: PrivacyLevel;
    isFeatured: boolean;
    createdAt: string;
  }>;
}

export const adminApi = {
  getStats: (): Promise<ApiResponse<AdminOverviewStats>> => {
    return axiosClient.get("/admin/stats");
  },

  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    isBanned?: boolean;
    vipTier?: string;
    vipPlan?: string;
  }): Promise<ApiResponse<PaginatedResult<any>>> => {
    return axiosClient.get("/admin/users", { params });
  },

  updateUserRole: (
    userId: string,
    role: UserRole,
  ): Promise<ApiResponse<any>> => {
    return axiosClient.patch(`/admin/users/${userId}/role`, { role });
  },

  toggleUserBan: (
    userId: string,
    isBanned: boolean,
  ): Promise<ApiResponse<any>> => {
    return axiosClient.patch(`/admin/users/${userId}/ban`, { isBanned });
  },

  updateUserVip: (
    userId: string,
    plan: "1_MONTH" | "1_YEAR" | "CANCEL",
  ): Promise<ApiResponse<any>> => {
    return axiosClient.post(`/admin/users/${userId}/vip`, { plan });
  },

  getSets: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    privacy?: PrivacyLevel;
    isFeatured?: boolean;
  }): Promise<ApiResponse<PaginatedResult<StudySet>>> => {
    return axiosClient.get("/admin/sets", { params });
  },

  toggleFeaturedSet: (
    setId: string,
    isFeatured: boolean,
  ): Promise<ApiResponse<StudySet>> => {
    return axiosClient.patch(`/admin/sets/${setId}/featured`, { isFeatured });
  },

  updateSetTags: (
    setId: string,
    tags: string[],
  ): Promise<ApiResponse<StudySet>> => {
    return axiosClient.patch(`/admin/sets/${setId}/tags`, { tags });
  },

  deleteSet: (setId: string): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/admin/sets/${setId}`);
  },

  getGroups: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResult<ClassGroup>>> => {
    return axiosClient.get("/admin/groups", { params });
  },

  getFeaturedTopics: (): Promise<ApiResponse<{ topics: string[] }>> => {
    return axiosClient.get("/admin/featured-topics");
  },

  updateFeaturedTopics: (
    topics: string[],
  ): Promise<ApiResponse<{ topics: string[] }>> => {
    return axiosClient.put("/admin/featured-topics", { topics });
  },
};
