"use client";

import { useRef } from "react";

interface UseCompositionOptions<T extends HTMLElement> {
  onKeyDown?: (e: React.KeyboardEvent<T>) => void;
  onCompositionStart?: (e: React.CompositionEvent<T>) => void;
  onCompositionEnd?: (e: React.CompositionEvent<T>) => void;
}

export function useComposition<T extends HTMLElement>(options: UseCompositionOptions<T> = {}) {
  const isComposingRef = useRef(false);

  const onCompositionStart = (e: React.CompositionEvent<T>) => {
    isComposingRef.current = true;
    options.onCompositionStart?.(e);
  };

  const onCompositionEnd = (e: React.CompositionEvent<T>) => {
    isComposingRef.current = false;
    options.onCompositionEnd?.(e);
  };

  const onKeyDown = (e: React.KeyboardEvent<T>) => {
    options.onKeyDown?.(e);
  };

  return { onCompositionStart, onCompositionEnd, onKeyDown };
}
