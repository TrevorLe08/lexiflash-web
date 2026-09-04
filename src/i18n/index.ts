import { useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../store/store";
import {
  setLanguage,
  toggleLanguage,
  LanguageMode,
} from "../store/slices/uiSlice";
import { vi } from "./locales/vi";
import { en } from "./locales/en";

export type TranslationDictionary = typeof vi;

const dictionaries: Record<LanguageMode, typeof vi> = {
  vi,
  en: en as typeof vi,
};

/**
 * Access nested properties using dot notation like 'nav.create' or 'vip.heroTitle'
 */
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split(".").reduce((prev, curr) => {
    return prev ? prev[curr] : undefined;
  }, obj);
}

export function useTranslation() {
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((state) => state.ui.language || "vi");

  const dictionary = dictionaries[currentLanguage] || dictionaries.vi;

  /**
   * Translate a key path, with optional interpolation params e.g. { count: 5 }
   */
  const t = useCallback(
    (
      key: string,
      params?: Record<string, string | number>,
      fallback?: string,
    ): string => {
      let value = getNestedValue(dictionary, key);

      if (value === undefined) {
        // Fallback to Vietnamese if English missing, or fallback string, or the key itself
        value = getNestedValue(dictionaries.vi, key) || fallback || key;
      }

      if (typeof value === "string" && params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          value = (value as string).replace(
            new RegExp(`\\{${paramKey}\\}`, "g"),
            String(paramVal),
          );
        });
      }

      return (value as string) || fallback || key;
    },
    [dictionary],
  );

  const changeLanguage = useCallback(
    (lang: LanguageMode) => {
      dispatch(setLanguage(lang));
    },
    [dispatch],
  );

  const switchLanguage = useCallback(() => {
    dispatch(toggleLanguage());
  }, [dispatch]);

  return {
    t,
    currentLanguage,
    changeLanguage,
    switchLanguage,
    isVietnamese: currentLanguage === "vi",
    isEnglish: currentLanguage === "en",
  };
}
