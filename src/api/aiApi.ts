import { axiosClient } from "./axiosClient";
import { ApiResponse } from "../types";

export interface AiGeneratedSetData {
  title: string;
  description: string;
  tags: string[];
  cards: Array<{
    term: string;
    definition: string;
    phonetic?: string;
    example?: string;
    hint?: string;
  }>;
}

export interface AiExplainTermData {
  term: string;
  definition: string;
  phonetic: string;
  partOfSpeech: string;
  mnemonicStory: string;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  commonCollocations: string[];
}

export const aiApi = {
  generateSet: (data: {
    prompt: string;
    cardCount?: number;
    sourceLanguage?: string;
    targetLanguage?: string;
  }): Promise<ApiResponse<AiGeneratedSetData>> => {
    return axiosClient.post("/ai/generate-set", data);
  },

  explainTerm: (data: {
    term: string;
    context?: string;
    targetLanguage?: string;
  }): Promise<ApiResponse<AiExplainTermData>> => {
    return axiosClient.post("/ai/explain", data);
  },
};
