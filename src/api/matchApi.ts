import { axiosClient } from "./axiosClient";
import { MatchGameCard, MatchLeaderboardEntry, ApiResponse } from "../types";

export const matchApi = {
  getTiles: (
    setId: string,
    pairCount = 6,
  ): Promise<ApiResponse<{ tiles: MatchGameCard[]; totalPairs: number }>> => {
    return axiosClient.get(`/match/sets/${setId}/tiles`, {
      params: { pairCount },
    });
  },

  submitScore: (
    setId: string,
    data: { timeRecordMs: number; matchedPairs: number },
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
