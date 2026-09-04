import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Card, UserCardProgress, SetStudyProgressSummary } from "../../types";
import { studyApi } from "../../api/studyApi";

interface StudyState {
  flashcards: Card[];
  currentCardIndex: number;
  isFlipped: boolean;
  starredCardIds: string[];
  dueReviews: Array<Card & { progress: UserCardProgress }>;
  progressSummary: SetStudyProgressSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: StudyState = {
  flashcards: [],
  currentCardIndex: 0,
  isFlipped: false,
  starredCardIds: [],
  dueReviews: [],
  progressSummary: null,
  loading: false,
  error: null,
};

export const fetchDueReviews = createAsyncThunk(
  "study/fetchDueReviews",
  async (setId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await studyApi.getDueReviews(setId);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch due review cards");
    }
  },
);

export const fetchSetProgress = createAsyncThunk(
  "study/fetchProgress",
  async (setId: string, { rejectWithValue }) => {
    try {
      const response = await studyApi.getProgress(setId);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const studySlice = createSlice({
  name: "study",
  initialState,
  reducers: {
    setFlashcards: (state, action: PayloadAction<Card[]>) => {
      state.flashcards = action.payload;
      state.currentCardIndex = 0;
      state.isFlipped = false;
    },
    setCurrentCardIndex: (state, action: PayloadAction<number>) => {
      state.currentCardIndex = action.payload;
      state.isFlipped = false;
    },
    nextCard: (state) => {
      if (state.currentCardIndex < state.flashcards.length - 1) {
        state.currentCardIndex += 1;
        state.isFlipped = false;
      }
    },
    prevCard: (state) => {
      if (state.currentCardIndex > 0) {
        state.currentCardIndex -= 1;
        state.isFlipped = false;
      }
    },
    toggleFlip: (state) => {
      state.isFlipped = !state.isFlipped;
    },
    setIsFlipped: (state, action: PayloadAction<boolean>) => {
      state.isFlipped = action.payload;
    },
    shuffleFlashcards: (state) => {
      state.flashcards = [...state.flashcards].sort(() => Math.random() - 0.5);
      state.currentCardIndex = 0;
      state.isFlipped = false;
    },
    toggleStarCard: (state, action: PayloadAction<string>) => {
      const cardId = action.payload;
      if (state.starredCardIds.includes(cardId)) {
        state.starredCardIds = state.starredCardIds.filter(
          (id) => id !== cardId,
        );
      } else {
        state.starredCardIds.push(cardId);
      }
    },
    resetStudyState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Due reviews
      .addCase(fetchDueReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDueReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.dueReviews = action.payload;
      })
      .addCase(fetchDueReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Progress summary
      .addCase(fetchSetProgress.fulfilled, (state, action) => {
        state.progressSummary = action.payload;
      });
  },
});

export const {
  setFlashcards,
  setCurrentCardIndex,
  nextCard,
  prevCard,
  toggleFlip,
  setIsFlipped,
  shuffleFlashcards,
  toggleStarCard,
  resetStudyState,
} = studySlice.actions;

export default studySlice.reducer;
