/**
 * React type augmentation to fix missing exports
 */

import React from 'react';

declare module 'react' {
  // Re-export the useEffect hook if it's missing
  export function useEffect(
    effect: React.EffectCallback,
    deps?: React.DependencyList
  ): void;

  // Re-export ChangeEvent if it's missing
  export interface ChangeEvent<T = Element> extends React.BaseSyntheticEvent<Event, EventTarget & T, EventTarget> {
    target: EventTarget & T;
  }

  // Re-export FormEvent if it's missing
  export interface FormEvent<T = Element> extends React.BaseSyntheticEvent<Event, EventTarget & T, EventTarget> {
    target: EventTarget & T;
  }
} 