import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export type LanguageMode = "vi" | "en";

interface UiState {
  toasts: ToastItem[];
  sidebarOpen: boolean;
  language: LanguageMode;
}

const getInitialLanguage = (): LanguageMode => {
  try {
    const saved = localStorage.getItem("lexiflash_lang") as LanguageMode;
    if (saved === "vi" || saved === "en") {
      return saved;
    }
  } catch {
    // Ignore localStorage errors
  }
  return "vi";
};

const initialState: UiState = {
  toasts: [],
  sidebarOpen: false,
  language: getInitialLanguage(),
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    addToast: (
      state,
      action: PayloadAction<{
        message: string;
        type?: "success" | "error" | "info";
      }>,
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      state.toasts.push({
        id,
        message: action.payload.message,
        type: action.payload.type || "info",
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setLanguage: (state, action: PayloadAction<LanguageMode>) => {
      state.language = action.payload;
      try {
        localStorage.setItem("lexiflash_lang", action.payload);
      } catch {
        // Ignore
      }
    },
    toggleLanguage: (state) => {
      const nextLang = state.language === "vi" ? "en" : "vi";
      state.language = nextLang;
      try {
        localStorage.setItem("lexiflash_lang", nextLang);
      } catch {
        // Ignore
      }
    },
  },
});

export const {
  addToast,
  removeToast,
  toggleSidebar,
  setSidebarOpen,
  setLanguage,
  toggleLanguage,
} = uiSlice.actions;

export default uiSlice.reducer;
