// This file fixes React JSX type issues by declaring the JSX namespace
// and properly mapping React components

import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react' {
  export const useState: <T>(initialState: T | (() => T)) => [T, (newState: T | ((prevState: T) => T)) => void];
  export const useEffect: (effect: () => void | (() => void), deps?: ReadonlyArray<any>) => void;
  export const useRef: <T>(initialValue: T) => { current: T };
  export const createContext: <T>(defaultValue: T) => React.Context<T>;
  export const useMemo: <T>(factory: () => T, deps: ReadonlyArray<any> | undefined) => T;
  export const useCallback: <T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>) => T;

  export interface ChangeEvent<T = Element> {
    target: EventTarget & T;
    currentTarget: EventTarget & T;
  }

  export interface FormEvent<T = Element> {
    target: EventTarget & T;
    currentTarget: EventTarget & T;
  }

  // Define common HTML element interfaces
  export interface HTMLAttributes<T> {
    className?: string;
    style?: React.CSSProperties;
    onClick?: (event: React.MouseEvent<T>) => void;
    // Add more as needed
  }

  export interface CSSProperties {
    [key: string]: any;
  }

  export interface MouseEvent<T = Element> {
    target: EventTarget & T;
    currentTarget: EventTarget & T;
  }

  export type FC<P = {}> = FunctionComponent<P>;
  export interface FunctionComponent<P = {}> {
    (props: P, context?: any): React.ReactElement<any, any> | null;
    displayName?: string;
  }

  export type ReactNode = React.ReactElement | string | number | boolean | null | undefined;
  export type ReactElement = any; // Simplified for brevity
} 