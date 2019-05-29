import * as React from "react";
import { useTheme, useEmotionCache } from "../Context";
import { ElementType } from "react";
import {
  getDefaultShouldForwardProp,
  StyledOptions,
  CreateStyled
} from "./utils";
import { getRegisteredStyles, insertStyles } from "@emotion/utils";
import { serializeStyles } from "@emotion/serialize";
import { createWithSSr } from "../withSSR";
let isBrowser = typeof document !== "undefined";

type StyledComponent = (
  props: Record<string, any>
) => React.ReactNode & {
  withComponent(nextTag: ElementType, nextOptions?: StyledOptions): any;
};

let createStyled = (tag: any, options?: StyledOptions) => {
  if (process.env.NODE_ENV !== "production") {
    if (tag === undefined) {
      throw new Error(
        "You are trying to create a styled element with an undefined component.\nYou may have forgotten to import it."
      );
    }
  }
  let identifierName;
  let shouldForwardProp;
  let targetClassName;
  if (options !== undefined) {
    identifierName = options.label;
    targetClassName = options.target;
    shouldForwardProp =
      tag.__emotion_forwardProp && options.shouldForwardProp
        ? propName =>
            tag.__emotion_forwardProp(propName) &&
            // $FlowFixMe
            options.shouldForwardProp(propName)
        : options.shouldForwardProp;
  }
  const isReal = tag.__emotion_real === tag;
  const baseTag = (isReal && tag.__emotion_base) || tag;

  if (typeof shouldForwardProp !== "function" && isReal) {
    shouldForwardProp = tag.__emotion_forwardProp;
  }
  let defaultShouldForwardProp =
    shouldForwardProp || getDefaultShouldForwardProp(baseTag);
  const shouldUseAs = !defaultShouldForwardProp("as");

  return function(): StyledComponent {
    let args = arguments;
    let styles =
      isReal && tag.__emotion_styles !== undefined
        ? tag.__emotion_styles.slice(0)
        : [];

    if (identifierName !== undefined) {
      styles.push(`label:${identifierName};`);
    }
    if (args[0] == null || args[0].raw === undefined) {
      styles.push.apply(styles, args);
    } else {
      styles.push(args[0][0]);
      let len = args.length;
      let i = 1;
      for (; i < len; i++) {
        styles.push(args[i], args[0][i]);
      }
    }

    const Styled: any = props => {
      const context = useEmotionCache();
      const theme = useTheme();

      const finalTag = (shouldUseAs && props.as) || baseTag;

      let className = "";
      let classInterpolations = [];
      let mergedProps = props;
      if (props.theme == null) {
        mergedProps = {};
        for (let key in props) {
          mergedProps[key] = props[key];
        }
        mergedProps.theme = theme;
      }

      if (typeof props.className === "string") {
        className += getRegisteredStyles(
          context.registered,
          classInterpolations,
          props.className
        );
      }
      const serialized = serializeStyles(
        styles.concat(classInterpolations),
        context.registered,
        mergedProps
      );
      const rules = insertStyles(
        context,
        serialized,
        typeof finalTag === "string"
      );
      className += `${context.key}-${serialized.name}`;
      if (targetClassName !== undefined) {
        className += ` ${targetClassName}`;
      }

      const finalShouldForwardProp =
        shouldUseAs && shouldForwardProp === undefined
          ? getDefaultShouldForwardProp(finalTag)
          : defaultShouldForwardProp;

      let newProps = {} as Record<string, any>;

      for (let key in props) {
        if (shouldUseAs && key === "as") continue;

        if (
          // $FlowFixMe
          finalShouldForwardProp(key)
        ) {
          newProps[key] = props[key];
        }
      }

      newProps.className = className;

      newProps.ref = props.ref || props.innerRef;
      if (process.env.NODE_ENV !== "production" && props.innerRef) {
        console.error(
          "`innerRef` is deprecated and will be removed in a future major version of Emotion, please use the `ref` prop instead" +
            (identifierName === undefined
              ? ""
              : ` in the usage of \`${identifierName}\``)
        );
      }

      const ele = React.createElement(finalTag, newProps);

      if (!isBrowser && rules !== undefined) {
        let serializedNames = serialized.name;
        let next = serialized.next;
        while (next !== undefined) {
          serializedNames += " " + next.name;
          next = next.next;
        }
        const withSSr = createWithSSr(context, serializedNames, rules);
        return withSSr(ele);
      }
      return ele;
    };

    Styled.displayName =
      identifierName !== undefined
        ? identifierName
        : `Styled(${
            typeof baseTag === "string"
              ? baseTag
              : baseTag.displayName || baseTag.name || "Component"
          })`;

    Styled.defaultProps = tag.defaultProps;
    Styled.__emotion_real = Styled;
    Styled.__emotion_base = baseTag;
    Styled.__emotion_styles = styles;
    Styled.__emotion_forwardProp = shouldForwardProp;

    Object.defineProperty(Styled, "toString", {
      value() {
        if (
          targetClassName === undefined &&
          process.env.NODE_ENV !== "production"
        ) {
          return "NO_COMPONENT_SELECTOR";
        }
        // $FlowFixMe
        return `.${targetClassName}`;
      }
    });

    // Styled.withComponent = (
    //   nextTag: ElementType,
    //   nextOptions?: StyledOptions
    // ) => {
    //   return createStyled(
    //     nextTag as any,
    //     nextOptions !== undefined
    //       ? { ...(options || {}), ...nextOptions }
    //       : options
    //   )(...styles);
    // };
    return Styled;
  };
};

export default (createStyled as any) as CreateStyled;
