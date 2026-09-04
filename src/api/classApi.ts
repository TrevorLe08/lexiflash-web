import { axiosClient } from "./axiosClient";
import { ClassGroup, ApiResponse } from "../types";

export const classApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<ClassGroup[]>> => {
    return axiosClient.get("/classes", { params });
  },

  getById: (id: string): Promise<ApiResponse<ClassGroup>> => {
    return axiosClient.get(`/classes/${id}`);
  },

  create: (data: {
    name: string;
    description?: string;
    schoolName?: string;
    allowMemberAddSets?: boolean;
    allowMemberInvite?: boolean;
  }): Promise<ApiResponse<ClassGroup>> => {
    return axiosClient.post("/classes", data);
  },

  joinByCode: (joinCode: string): Promise<ApiResponse<ClassGroup>> => {
    return axiosClient.post("/classes/join", { joinCode });
  },

  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      schoolName?: string;
      allowMemberAddSets?: boolean;
      allowMemberInvite?: boolean;
    },
  ): Promise<ApiResponse<ClassGroup>> => {
    return axiosClient.put(`/classes/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/classes/${id}`);
  },

  addSets: (
    id: string,
    studySetIds: string[],
  ): Promise<ApiResponse<ClassGroup>> => {
    return axiosClient.post(`/classes/${id}/sets/add`, { studySetIds });
  },

  removeSets: (
    id: string,
    studySetIds: string[],
  ): Promise<ApiResponse<ClassGroup>> => {
    return axiosClient.post(`/classes/${id}/sets/remove`, { studySetIds });
  },
};
