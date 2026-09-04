import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { StudySet, PrivacyLevel, StudyLevel } from "../../types";
import { studySetApi } from "../../api/studySetApi";
import { addToast } from "./uiSlice";

interface StudySetState {
  sets: StudySet[];
  currentSet: StudySet | null;
  totalItems: number;
  loading: boolean;
  error: string | null;
}

const initialState: StudySetState = {
  sets: [],
  currentSet: null,
  totalItems: 0,
  loading: false,
  error: null,
};

export const fetchStudySets = createAsyncThunk(
  "studySets/fetchAll",
  async (
    params:
      | {
          search?: string;
          tag?: string;
          level?: StudyLevel;
          onlyMine?: boolean;
          onlyStarred?: boolean;
          onlyBookmarked?: boolean;
          sortBy?: string;
          sortOrder?: "asc" | "desc";
          page?: number;
          limit?: number;
        }
      | undefined,
    { rejectWithValue },
  ) => {
    try {
      const response = await studySetApi.getAll(params);
      return {
        items: response.data,
        total: response.meta?.totalItems || response.data.length,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch study sets");
    }
  },
);

export const fetchStudySetById = createAsyncThunk(
  "studySets/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await studySetApi.getById(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch study set");
    }
  },
);

export const createStudySet = createAsyncThunk(
  "studySets/create",
  async (
    data: {
      title: string;
      description?: string;
      privacy?: PrivacyLevel;
      level?: StudyLevel;
      tags?: string[];
      cards?: Array<{
        term: string;
        definition: string;
        phonetic?: string;
        example?: string;
        hint?: string;
      }>;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await studySetApi.create(data);
      dispatch(
        addToast({
          message: "Study set created successfully!",
          type: "success",
        }),
      );
      return response.data;
    } catch (err: any) {
      const msg = err.message || "Failed to create study set";
      dispatch(addToast({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  },
);

export const toggleStarSet = createAsyncThunk(
  "studySets/toggleStar",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await studySetApi.toggleStar(id);
      dispatch(
        addToast({
          message: response.data.isStarred
            ? "Saved to your favorites"
            : "Removed from favorites",
          type: "info",
        }),
      );
      return { id, ...response.data };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const studySetSlice = createSlice({
  name: "studySets",
  initialState,
  reducers: {
    clearCurrentSet: (state) => {
      state.currentSet = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sets
      .addCase(fetchStudySets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudySets.fulfilled, (state, action) => {
        state.loading = false;
        state.sets = action.payload.items;
        state.totalItems = action.payload.total;
      })
      .addCase(fetchStudySets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch By Id
      .addCase(fetchStudySetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudySetById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSet = action.payload;
      })
      .addCase(fetchStudySetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle Star
      .addCase(toggleStarSet.fulfilled, (state, action) => {
        const { id, isStarred } = action.payload;
        if (state.currentSet && state.currentSet.id === id) {
          state.currentSet.isStarredByCurrentUser = isStarred;
        }
        const setInList = state.sets.find((s) => s.id === id);
        if (setInList) {
          setInList.isStarredByCurrentUser = isStarred;
        }
      });
  },
});

export const { clearCurrentSet } = studySetSlice.actions;
export default studySetSlice.reducer;
