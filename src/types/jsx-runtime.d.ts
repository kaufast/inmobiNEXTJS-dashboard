// This file fixes the "This JSX tag requires the module path 'react/jsx-runtime'" error
declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  
  export function jsx(
    type: any,
    props: any,
    key?: string
  ): JSX.Element;
  
  export function jsxs(
    type: any,
    props: any,
    key?: string
  ): JSX.Element;
} 