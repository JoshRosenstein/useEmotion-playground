import React from "react";
import { isBrowser } from "./utils";

export const createWithSSr = (context, serializedHashes, rules) => ele => {
  if (!isBrowser && rules.length !== 0) {
    console.log("createWithSSr.Test");
    return (
      <React.Fragment>
        <style
          {...{
            [`data-emotion-${context.key}222`]: serializedHashes.substring(1),
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
