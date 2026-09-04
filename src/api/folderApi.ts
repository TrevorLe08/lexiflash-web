import { axiosClient } from "./axiosClient";
import { Folder, ApiResponse } from "../types";

export const folderApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<Folder[]>> => {
    return axiosClient.get("/folders", { params });
  },

  getById: (id: string): Promise<ApiResponse<Folder>> => {
    return axiosClient.get(`/folders/${id}`);
  },

  create: (data: {
    title: string;
    description?: string;
    studySetIds?: string[];
  }): Promise<ApiResponse<Folder>> => {
    return axiosClient.post("/folders", data);
  },

  update: (
    id: string,
    data: {
      title?: string;
      description?: string;
    },
  ): Promise<ApiResponse<Folder>> => {
    return axiosClient.put(`/folders/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/folders/${id}`);
  },

  addSets: (
    id: string,
    studySetIds: string[],
  ): Promise<ApiResponse<Folder>> => {
    return axiosClient.post(`/folders/${id}/sets/add`, { studySetIds });
  },

  removeSets: (
    id: string,
    studySetIds: string[],
  ): Promise<ApiResponse<Folder>> => {
    return axiosClient.post(`/folders/${id}/sets/remove`, { studySetIds });
  },
};
