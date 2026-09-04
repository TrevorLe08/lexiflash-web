import { axiosClient } from "./axiosClient";
import { StudySet, ApiResponse, PrivacyLevel, StudyLevel } from "../types";

export const studySetApi = {
  getAll: (params?: {
    search?: string;
    tag?: string;
    level?: StudyLevel;
    creatorId?: string;
    onlyMine?: boolean;
    onlyStarred?: boolean;
    onlyBookmarked?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<StudySet[]>> => {
    return axiosClient.get("/study-sets", { params });
  },

  getBookmarked: (): Promise<ApiResponse<StudySet[]>> => {
    return axiosClient.get("/study-sets/bookmarked");
  },

  getById: (id: string, password?: string): Promise<ApiResponse<StudySet>> => {
    return axiosClient.get(`/study-sets/${id}`, {
      params: password ? { password } : undefined,
    });
  },

  create: (data: {
    title: string;
    description?: string;
    privacy?: PrivacyLevel;
    password?: string;
    level?: StudyLevel;
    sourceLanguage?: string;
    targetLanguage?: string;
    tags?: string[];
    cards?: Array<{
      term: string;
      definition: string;
      phonetic?: string;
      example?: string;
      hint?: string;
      imageUrl?: string;
      audioUrl?: string;
    }>;
  }): Promise<ApiResponse<StudySet>> => {
    return axiosClient.post("/study-sets", data);
  },

  update: (
    id: string,
    data: {
      title?: string;
      description?: string;
      privacy?: PrivacyLevel;
      password?: string;
      level?: StudyLevel;
      sourceLanguage?: string;
      targetLanguage?: string;
      tags?: string[];
      cards?: Array<{
        id?: string;
        term: string;
        definition: string;
        phonetic?: string;
        example?: string;
        hint?: string;
        imageUrl?: string;
        audioUrl?: string;
        orderIndex?: number;
      }>;
    },
  ): Promise<ApiResponse<StudySet>> => {
    return axiosClient.put(`/study-sets/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/study-sets/${id}`);
  },

  clone: (id: string): Promise<ApiResponse<StudySet>> => {
    return axiosClient.post(`/study-sets/${id}/clone`);
  },

  toggleStar: (
    id: string,
  ): Promise<ApiResponse<{ isStarred: boolean; starCount: number }>> => {
    return axiosClient.post(`/study-sets/${id}/star`);
  },

  toggleBookmark: (
    id: string,
  ): Promise<ApiResponse<{ isBookmarked: boolean; bookmarkCount: number }>> => {
    return axiosClient.post(`/study-sets/${id}/bookmark`);
  },
};
