import { axiosClient } from "./axiosClient";
import {
  UnifiedSearchResult,
  ExploreRecommendationResult,
  ApiResponse,
} from "../types";

export const searchApi = {
  search: (
    q: string,
    type: "all" | "sets" | "users" | "folders" | "classes" = "all",
    limit = 10,
  ): Promise<ApiResponse<UnifiedSearchResult>> => {
    return axiosClient.get("/search", {
      params: { q, type, limit },
    });
  },

  getExploreRecommendations: (): Promise<
    ApiResponse<ExploreRecommendationResult>
  > => {
    return axiosClient.get("/search/explore");
  },
};
