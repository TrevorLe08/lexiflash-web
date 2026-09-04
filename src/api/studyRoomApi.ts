import { axiosClient } from "./axiosClient";
import {
  StudyRoomDashboardData,
  StudyRoomSession,
  DailyQuest,
  TimerMode,
} from "../types/studyRoom.types";
import { ApiResponse } from "../types";

export const studyRoomApi = {
  getDailyDashboard: (): Promise<ApiResponse<StudyRoomDashboardData>> => {
    return axiosClient.get("/study-room/daily-dashboard");
  },

  recordSession: (data: {
    deckId?: string;
    mode: TimerMode;
    durationSeconds: number;
    startedAt: string;
    completedAt: string;
    cardsReviewedCount?: number;
  }): Promise<ApiResponse<StudyRoomSession>> => {
    return axiosClient.post("/study-room/sessions", data);
  },

  createCustomQuest: (data: {
    title: string;
    targetCount?: number;
  }): Promise<ApiResponse<DailyQuest>> => {
    return axiosClient.post("/study-room/quests/custom", data);
  },

  toggleQuest: (id: string): Promise<ApiResponse<DailyQuest>> => {
    return axiosClient.patch(`/study-room/quests/${id}/toggle`);
  },

  deleteCustomQuest: (id: string): Promise<ApiResponse<{ id: string }>> => {
    return axiosClient.delete(`/study-room/quests/${id}`);
  },
};
