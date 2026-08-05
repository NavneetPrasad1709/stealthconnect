"use client";

import { useEffect } from "react";

/* Lazy sections mount and grow while the browser is jumping to a hash
   anchor, pushing the target further down and leaving the viewport on
   the wrong section. Re-snap to the target a few times until layout
   settles; cancel as soon as the user scrolls on their own. */
export function HashScrollFix() {
  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];

    const cancel = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };

    const settle = () => {
      cancel();
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      [0, 150, 400, 800, 1400].forEach((d) =>
        timers.push(setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ block: "start" });
        }, d)),
      );
      // A real user scroll means they took over; stop snapping.
      const stop = () => cancel();
      window.addEventListener("wheel", stop, { once: true, passive: true });
      window.addEventListener("touchstart", stop, { once: true, passive: true });
    };

    settle();
    window.addEventListener("hashchange", settle);
    return () => {
      cancel();
      window.removeEventListener("hashchange", settle);
    };
  }, []);

  return null;
}
