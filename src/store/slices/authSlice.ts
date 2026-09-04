import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types";
import { authApi } from "../../api/authApi";
import { addToast } from "./uiSlice";
import { resetStudyState } from "./studySlice";
import { resetStudyTimerAcrossTabs } from "../../hooks/useStudyTimer";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state from localStorage if available
const storedToken = localStorage.getItem("lexiflash_access_token");
const storedUserJson = localStorage.getItem("lexiflash_user");
let parsedUser: User | null = null;
if (storedUserJson) {
  try {
    parsedUser = JSON.parse(storedUserJson);
  } catch {
    parsedUser = null;
  }
}

const initialState: AuthState = {
  user: parsedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    data: { email: string; username: string; password: string; name: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await authApi.register(data);
      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem("lexiflash_access_token", accessToken);
      localStorage.setItem("lexiflash_refresh_token", refreshToken);
      localStorage.setItem("lexiflash_user", JSON.stringify(user));

      dispatch(
        addToast({
          message: `Welcome to LexiFlash, ${user.name}!`,
          type: "success",
        }),
      );
      return { user, accessToken };
    } catch (err: any) {
      const msg = err.message || "Registration failed";
      dispatch(addToast({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    data: { loginIdentifier: string; password: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await authApi.login(data);
      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem("lexiflash_access_token", accessToken);
      localStorage.setItem("lexiflash_refresh_token", refreshToken);
      localStorage.setItem("lexiflash_user", JSON.stringify(user));

      dispatch(
        addToast({ message: `Welcome back, ${user.name}!`, type: "success" }),
      );
      return { user, accessToken };
    } catch (err: any) {
      const msg = err.message || "Login failed";
      dispatch(addToast({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  },
);

export const checkCurrentUser = createAsyncThunk(
  "auth/checkMe",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("lexiflash_access_token");
      if (!token) return null;
      const response = await authApi.getMe();
      const user = response.data;
      localStorage.setItem("lexiflash_user", JSON.stringify(user));
      return user;
    } catch (err: any) {
      localStorage.removeItem("lexiflash_access_token");
      localStorage.removeItem("lexiflash_refresh_token");
      localStorage.removeItem("lexiflash_user");
      return rejectWithValue(err.message);
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    const refreshToken =
      localStorage.getItem("lexiflash_refresh_token") || undefined;
    try {
      await authApi.logout(refreshToken);
    } catch {
      // ignore
    } finally {
      resetStudyTimerAcrossTabs();
      dispatch(resetStudyState());
      localStorage.removeItem("lexiflash_access_token");
      localStorage.removeItem("lexiflash_refresh_token");
      localStorage.removeItem("lexiflash_user");
      localStorage.removeItem("lexiflash_study_timer_v1");
      localStorage.removeItem("lexiflash_study_timer_v2");
      dispatch(addToast({ message: "Logged out successfully", type: "info" }));
    }
  },
);

import { studyApi } from "../../api/studyApi";

export const recordStudyStreak = createAsyncThunk(
  "auth/recordStreak",
  async (_, { dispatch }) => {
    try {
      const res = await studyApi.recordStreak();
      const streakData = res.data;
      if (streakData && streakData.streakInfo) {
        dispatch(authSlice.actions.updateUserStreak(streakData.streakInfo));
        if (streakData.streakIncreased) {
          dispatch(
            addToast({
              message: `🔥 Bạn đã tăng chuỗi học tập lên ${streakData.streakInfo.streakCount} ngày!`,
              type: "success",
            }),
          );
        } else if (streakData.streakMaintained) {
          dispatch(
            addToast({
              message: `🔥 Đã giữ vững chuỗi ${streakData.streakInfo.streakCount} ngày hôm nay!`,
              type: "info",
            }),
          );
        }
      }
      return streakData;
    } catch {
      // ignore
    }
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("lexiflash_user", JSON.stringify(action.payload));
    },
    updateUserStreak: (
      state,
      action: PayloadAction<{
        streakCount: number;
        lastStudyDate?: string;
        isStreakActiveToday?: boolean;
        isStreakAtRisk?: boolean;
        streakStatus?: any;
      }>,
    ) => {
      if (state.user) {
        state.user.streakCount = action.payload.streakCount;
        state.user.lastStudyDate = action.payload.lastStudyDate;
        state.user.isStreakActiveToday =
          action.payload.isStreakActiveToday ?? true;
        state.user.isStreakAtRisk = action.payload.isStreakAtRisk ?? false;
        state.user.streakStatus = action.payload.streakStatus ?? "ACTIVE";
        localStorage.setItem("lexiflash_user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check Me
      .addCase(checkCurrentUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, updateUserStreak } = authSlice.actions;
export default authSlice.reducer;
