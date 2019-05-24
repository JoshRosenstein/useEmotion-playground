import { getRegisteredStyles } from "@emotion/utils";

export let isBrowser = typeof document !== "undefined";

export function merge(
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
export function classnames(args: Array<any>): string {
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
