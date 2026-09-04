import { axiosClient } from "./axiosClient";
import { GeneratedTest, TestResult, QuestionType, ApiResponse } from "../types";

export const testApi = {
  generate: (
    setId: string,
    options?: {
      questionCount?: number;
      questionTypes?: QuestionType[];
      starredOnly?: boolean;
    },
  ): Promise<ApiResponse<GeneratedTest>> => {
    return axiosClient.post(`/test/sets/${setId}/generate`, options || {});
  },

  submit: (
    testId: string,
    data: {
      timeSpentSeconds: number;
      answers: Array<{
        questionId: string;
        cardId: string;
        userAnswer: string;
      }>;
    },
  ): Promise<ApiResponse<TestResult>> => {
    return axiosClient.post(`/test/${testId}/submit`, data);
  },

  getHistories: (setId?: string): Promise<ApiResponse<TestResult[]>> => {
    return axiosClient.get("/test/history", {
      params: setId ? { setId } : undefined,
    });
  },
};
