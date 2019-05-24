import createCache from "@emotion/cache";
import { EmotionCache } from "@emotion/utils";
import React, { createContext } from "react";
import { useContext } from "react";

export const ThemeContext = createContext<{} | null>(null);
export const EmotionCacheContext = createContext<EmotionCache>(createCache());

export const useEmotionCache = () => useContext(EmotionCacheContext);
export const useTheme = <T>(): T => {
  const theme = React.useContext(ThemeContext);

  if (theme === null) {
    throw new Error("No theme passed");
  }

  return theme as any;
};
