import * as React from "react";
import isPropValid from "@emotion/is-prop-valid";
import { ComponentSelector, Interpolation } from "@emotion/serialize";

export type Interpolations = Array<any>;

const testOmitPropsOnStringTag = isPropValid;

const testOmitPropsOnComponent = (key: string) =>
  key !== "theme" && key !== "innerRef";

export const getDefaultShouldForwardProp = (tag: React.ElementType) =>
  typeof tag === "string" && tag.charCodeAt(0) > 96
    ? testOmitPropsOnStringTag
    : testOmitPropsOnComponent;

type JSXInEl = JSX.IntrinsicElements;

export type WithTheme<P, T> = P extends { theme: infer Theme }
  ? P & { theme: Exclude<Theme, undefined> }
  : P & { theme: T };

export interface StyledOptions {
  label?: string;
  shouldForwardProp?(propName: string): boolean;
  target?: string;
}

export interface StyledComponent<InnerProps, StyleProps, Theme extends object>
  extends React.SFC<InnerProps & StyleProps & { theme?: Theme }>,
    ComponentSelector {
  /**
   * @desc this method is type-unsafe
   */
  withComponent<NewTag extends keyof JSXInEl>(
    tag: NewTag
  ): StyledComponent<JSXInEl[NewTag], StyleProps, Theme>;
  withComponent<Tag extends React.ComponentType<any>>(
    tag: Tag
  ): StyledComponent<PropsOf<Tag>, StyleProps, Theme>;
}

type ReactClassPropKeys = keyof React.ClassAttributes<any>;
export interface CreateStyledComponentBase<
  InnerProps,
  ExtraProps,
  Theme extends object
> {
  <
    StyleProps extends Omit<
      Overwrapped<InnerProps, StyleProps>,
      ReactClassPropKeys
    > = Omit<InnerProps & ExtraProps, ReactClassPropKeys>
  >(
    ...styles: Array<Interpolation<WithTheme<StyleProps, Theme>>>
  ): StyledComponent<InnerProps, StyleProps, Theme>;
  <
    StyleProps extends Omit<
      Overwrapped<InnerProps, StyleProps>,
      ReactClassPropKeys
    > = Omit<InnerProps & ExtraProps, ReactClassPropKeys>
  >(
    template: TemplateStringsArray,
    ...styles: Array<Interpolation<WithTheme<StyleProps, Theme>>>
  ): StyledComponent<InnerProps, StyleProps, Theme>;
}
export interface CreateStyledComponentIntrinsic<
  Tag extends keyof JSXInEl,
  ExtraProps,
  Theme extends object
> extends CreateStyledComponentBase<JSXInEl[Tag], ExtraProps, Theme> {}
export interface CreateStyledComponentExtrinsic<
  Tag extends React.ComponentType<any>,
  ExtraProps,
  Theme extends object
> extends CreateStyledComponentBase<PropsOf<Tag>, ExtraProps, Theme> {}

/**
 * @desc
 * This function accepts `InnerProps`/`Tag` to infer the type of `tag`,
 * and accepts `ExtraProps` for user who use string style
 * to be able to declare extra props without using
 * `` styled('button')<ExtraProps>`...` ``, which does not supported in
 * styled-component VSCode extension.
 * If your tool support syntax highlighting for `` styled('button')<ExtraProps>`...` ``
 * it could be more efficient.
 */
export interface CreateStyled<Theme extends object = any> {
  <Tag extends React.ComponentType<any>, ExtraProps = {}>(
    tag: Tag,
    options?: StyledOptions
  ): CreateStyledComponentExtrinsic<Tag, ExtraProps, Theme>;

  <Tag extends keyof JSXInEl, ExtraProps = {}>(
    tag: Tag,
    options?: StyledOptions
  ): CreateStyledComponentIntrinsic<Tag, ExtraProps, Theme>;
}

export type PropsOf<
  Tag extends React.ComponentType<any>
> = Tag extends React.SFC<infer Props>
  ? Props & React.Attributes
  : Tag extends React.ComponentClass<infer Props>
  ? (Tag extends new (...args: Array<any>) => infer Instance
      ? Props & React.ClassAttributes<Instance>
      : never)
  : never;

export type Omit<T, U> = T extends any ? Pick<T, Exclude<keyof T, U>> : never;
export type Overwrapped<T, U> = Pick<T, Extract<keyof T, keyof U>>;
