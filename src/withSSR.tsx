import React from "react";
import { isBrowser } from "./utils";

export const createWithSSr = (context, serializedNames, rules) => ele => {
  if (!isBrowser && rules.length !== 0) {
    console.log("createWithSSr.Test");
    return (
      <React.Fragment>
        <style
          {...{
            [`data-emotion-${context.key}`]: serializedNames,
            dangerouslySetInnerHTML: { __html: rules },
            nonce: context.sheet.nonce,
            "data-ssr": !isBrowser
          }}
        />
        {ele}
      </React.Fragment>
    );
  }
  return <React.Fragment> {ele}</React.Fragment>;
};
