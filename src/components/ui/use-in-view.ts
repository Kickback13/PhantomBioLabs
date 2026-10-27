"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Callback ref plus a boolean that is true while the element is near the viewport. */
export function useInView<T extends Element>(options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const { root, rootMargin, threshold } = options ?? {};

  const ref = useCallback(
    (node: T | null) => {
      observer.current?.disconnect();
      if (!node || typeof IntersectionObserver === "undefined") return;
      observer.current = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
        root,
        rootMargin,
        threshold,
      });
      observer.current.observe(node);
    },
    [root, rootMargin, threshold],
  );

  useEffect(() => () => observer.current?.disconnect(), []);
  return [ref, inView] as const;
}

/** True while the media query matches. False during server rendering. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);
  return matches;
}
