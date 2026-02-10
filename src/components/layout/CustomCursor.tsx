import { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, [role='button'], [data-cursor='hover']";

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.left = `${event.clientX}px`;
      cursorRef.current.style.top = `${event.clientY}px`;
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    const handleOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        setIsHovering(true);
      }
    };

    const handleOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        setIsHovering(false);
      }
    };

    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);

    return () => {
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor ${isHovering ? "is-hover" : ""}`}
      aria-hidden="true"
    />
  );
};
