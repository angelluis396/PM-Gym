import { useState, useEffect } from "react";

/**
 * Returns the current window width, updating on resize.
 * Use isMobile = width < 768 for mobile layouts.
 */
export function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    function handle() { setWidth(window.innerWidth); }
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return width;
}
