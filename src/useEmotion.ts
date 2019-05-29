import createCache from "@emotion/cache";
import { serializeStyles } from "@emotion/serialize";
import {
  EmotionCache,
  getRegisteredStyles,
  insertStyles
} from "@emotion/utils";
import React, { createContext, useRef, useEffect } from "react";
import { useTheme, useEmotionCache } from "./Context";
import { isBrowser, merge, classnames } from "./utils";
import { createWithSSr } from "./withSSR";
// TODO TYPES
export const useEmotion = <T = Record<string, any>>() => {
  const context = useEmotionCache();
  const theme = useTheme<T>();
  let rules = ""; // useRef("");
  let hasRendered = false;
  // useEffect(() => {
  //   hasRendered.current = true;
  // }, []);
  // let rules = "";
  let serializedHashes = "";

  let css = (...args: Array<any>) => {
    if (hasRendered && process.env.NODE_ENV !== "production") {
      throw new Error("css can only be used during render");
    }
    let serialized = serializeStyles(args, context.registered);
    if (isBrowser) {
      let a = insertStyles(context, serialized, false);

      console.log({ rules: a });
    } else {
      let res = insertStyles(context, serialized, false);
      if (res !== undefined) {
        rules += res;
      }
    }

    if (!isBrowser) {
      serializedHashes += ` ${serialized.name}`;
    }
    return `${context.key}-${serialized.name}`;
  };
  let cx = (...args: Array<any>) => {
    if (hasRendered && process.env.NODE_ENV !== "production") {
      throw new Error("cx can only be used during render");
    }
    return merge(context.registered, css, classnames(args));
  };

  let content = { css, cx, theme };

  return {
    css,
    cx,
    theme,
    withSSr: createWithSSr(context, serializedHashes.substring(1), rules)
  };
};
