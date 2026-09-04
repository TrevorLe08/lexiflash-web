import { axiosClient } from "./axiosClient";
import { Card, ApiResponse } from "../types";

export const cardApi = {
  getBySetId: (setId: string): Promise<ApiResponse<Card[]>> => {
    return axiosClient.get(`/study-sets/${setId}/cards`);
  },

  create: (
    setId: string,
    data: {
      term: string;
      definition: string;
      phonetic?: string;
      example?: string;
      hint?: string;
      imageUrl?: string;
      audioUrl?: string;
    },
  ): Promise<ApiResponse<Card>> => {
    return axiosClient.post(`/study-sets/${setId}/cards`, data);
  },

  bulkCreate: (
    setId: string,
    cards: Array<{
      term: string;
      definition: string;
      phonetic?: string;
      example?: string;
      hint?: string;
      imageUrl?: string;
      audioUrl?: string;
    }>,
  ): Promise<ApiResponse<Card[]>> => {
    return axiosClient.post(`/study-sets/${setId}/cards/bulk`, { cards });
  },

  importFromText: (
    setId: string,
    data: {
      text: string;
      termSeparator?: string;
      cardSeparator?: string;
    },
  ): Promise<ApiResponse<Card[]>> => {
    return axiosClient.post(`/study-sets/${setId}/cards/import`, data);
  },

  update: (
    id: string,
    data: {
      term?: string;
      definition?: string;
      phonetic?: string;
      example?: string;
      hint?: string;
      imageUrl?: string;
      audioUrl?: string;
      orderIndex?: number;
    },
  ): Promise<ApiResponse<Card>> => {
    return axiosClient.put(`/cards/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/cards/${id}`);
  },

  toggleStar: (id: string): Promise<ApiResponse<{ isStarred: boolean }>> => {
    return axiosClient.post(`/cards/${id}/star`);
  },
};
