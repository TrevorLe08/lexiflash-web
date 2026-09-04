import { axiosClient } from "./axiosClient";
import {
  Card,
  UserCardProgress,
  SetStudyProgressSummary,
  StudyMode,
  ApiResponse,
} from "../types";

export const studyApi = {
  getFlashcards: (
    setId: string,
    params?: { shuffle?: boolean; starredOnly?: boolean },
  ): Promise<ApiResponse<Card[]>> => {
    return axiosClient.get(`/study/sets/${setId}/flashcards`, { params });
  },

  submitLearnAnswer: (
    setId: string,
    data: { cardId: string; quality: number; userResponse?: string },
  ): Promise<
    ApiResponse<{ progress: UserCardProgress; isCorrect: boolean }>
  > => {
    return axiosClient.post(`/study/learn/${setId}/answer`, data);
  },

  getDueReviews: (
    setId?: string,
  ): Promise<ApiResponse<Array<Card & { progress: UserCardProgress }>>> => {
    return axiosClient.get("/study/reviews-due", {
      params: setId ? { setId } : undefined,
    });
  },

  getMistakeBank: (): Promise<
    ApiResponse<
      Array<Card & { progress: UserCardProgress; studySetTitle?: string }>
    >
  > => {
    return axiosClient.get("/study/mistakes");
  },

  submitMistakeAnswer: (data: {
    cardId: string;
    isCorrect: boolean;
  }): Promise<
    ApiResponse<{
      cardId: string;
      isCorrect: boolean;
      lapses: number;
      removedFromMistakeBank: boolean;
      progress: UserCardProgress;
    }>
  > => {
    return axiosClient.post("/study/mistakes/answer", data);
  },

  getProgress: (
    setId: string,
  ): Promise<ApiResponse<SetStudyProgressSummary>> => {
    return axiosClient.get(`/study/progress/${setId}`);
  },

  recordSession: (data: {
    studySetId: string;
    mode: StudyMode;
    cardsTotal: number;
    cardsCorrect: number;
    cardsIncorrect: number;
    timeSpentSeconds: number;
  }): Promise<ApiResponse<any>> => {
    return axiosClient.post("/study/session", data);
  },

  recordStreak: (): Promise<
    ApiResponse<{
      streakInfo: {
        streakCount: number;
        lastStudyDate?: string;
        isStreakActiveToday: boolean;
        isStreakAtRisk: boolean;
        streakStatus: string;
      };
      streakIncreased: boolean;
      streakMaintained: boolean;
    }>
  > => {
    return axiosClient.post("/study/streak/record");
  },

  getStreak: (): Promise<
    ApiResponse<{
      streakCount: number;
      lastStudyDate?: string;
      isStreakActiveToday: boolean;
      isStreakAtRisk: boolean;
      streakStatus: string;
    }>
  > => {
    return axiosClient.get("/study/streak");
  },
};
