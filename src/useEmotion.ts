import createCache from "@emotion/cache";
import { serializeStyles } from "@emotion/serialize";
import {
  EmotionCache,
  getRegisteredStyles,
  insertStyles
} from "@emotion/utils";

import React, { createContext } from "react";

export const ThemeContext = createContext<{} | null>(null);

export const useTheme = <T>(): T => {
  const theme = React.useContext(ThemeContext);

  if (theme === null) {
    throw new Error("No theme passed");
  }

  return theme as any;
};
export const EmotionCacheContext = createContext<EmotionCache>(createCache());

export const useEmotionCache = () => React.useContext(EmotionCacheContext);
// TODO TYPES
export const useEmotion = <T = Record<string, any>>() => {
  const context = useEmotionCache();
  const theme = useTheme<T>();
  let hasRendered = false;

  let css = (...args: Array<any>) => {
    if (hasRendered && process.env.NODE_ENV !== "production") {
      throw new Error("css can only be used during render");
    }
    let serialized = serializeStyles(args, context.registered);
    insertStyles(context, serialized, false);
    return `${context.key}-${serialized.name}`;
  };

  let cx = (...args: Array<any>) => {
    if (hasRendered && process.env.NODE_ENV !== "production") {
      throw new Error("cx can only be used during render");
    }
    return merge(context.registered, css, classnames(args));
  };
  return { css, cx, theme };
};

function merge(
  registered: any,
  css: (...args: Array<any>) => string,
  className: string
) {
  const registeredStyles = [];

  const rawClassName = getRegisteredStyles(
    registered,
    registeredStyles,
    className
  );

  if (registeredStyles.length < 2) {
    return className;
  }
  return rawClassName + css(registeredStyles);
}
function classnames(args: Array<any>): string {
  let len = args.length;
  let i = 0;
  let cls = "";
  for (; i < len; i++) {
    let arg = args[i];
    if (arg == null) continue;

    let toAdd;
    switch (typeof arg) {
      case "boolean":
        break;
      case "object": {
        if (Array.isArray(arg)) {
          toAdd = classnames(arg);
        } else {
          toAdd = "";
          for (const k in arg) {
            if (arg[k] && k) {
              toAdd && (toAdd += " ");
              toAdd += k;
            }
          }
        }
        break;
      }
      default: {
        toAdd = arg;
      }
    }
    if (toAdd) {
      cls && (cls += " ");
      cls += toAdd;
    }
  }
  return cls;
}
