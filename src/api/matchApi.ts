import { axiosClient } from "./axiosClient";
import {
  MatchLeaderboardEntry,
  MatchTilesResponse,
  ApiResponse,
} from "../types";

export const matchApi = {
  getTiles: (
    setId: string,
    pairCount = 6,
  ): Promise<ApiResponse<MatchTilesResponse>> => {
    return axiosClient.get(`/match/sets/${setId}/tiles`, {
      params: { pairCount },
    });
  },

  submitScore: (
    setId: string,
    data: {
      timeRecordMs: number;
      matchedPairs: number;
      sessionToken: string;
    },
  ): Promise<
    ApiResponse<{ entry: MatchLeaderboardEntry; isNewPersonalBest: boolean }>
  > => {
    return axiosClient.post(`/match/sets/${setId}/submit`, data);
  },

  getLeaderboard: (
    setId: string,
  ): Promise<ApiResponse<MatchLeaderboardEntry[]>> => {
    return axiosClient.get(`/match/sets/${setId}/leaderboard`);
  },
};
