"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  rootMargin?: string;
  minHeight?: number;
  once?: boolean;
  /* Anchor id lives on the wrapper (always in the DOM) so /#hash links
     work even before the lazy section has mounted. */
  id?: string;
};

export function LazyOnView({
  children,
  rootMargin = "300px 0px",
  minHeight = 400,
  once = true,
  id,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown || !ref.current || typeof IntersectionObserver === "undefined") {
      if (typeof IntersectionObserver === "undefined") setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            if (once) obs.disconnect();
            return;
          }
        }
      },
      { rootMargin },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [shown, once, rootMargin]);

  return (
    <div
      ref={ref}
      id={id}
      style={{ scrollMarginTop: id ? 80 : undefined, ...(shown ? {} : { minHeight }) }}
    >
      {shown ? children : null}
    </div>
  );
}
