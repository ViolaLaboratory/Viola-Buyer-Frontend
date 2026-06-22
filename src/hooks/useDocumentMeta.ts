import { useEffect } from "react";

/**
 * Per-route <title> + meta description for the SPA (no server head to override).
 * Restores the previous values on unmount so navigating back to "/" keeps the
 * defaults baked into index.html. Native DOM only — no helmet dependency.
 */
export function useDocumentMeta(title: string, description: string) {
  useEffect(() => {
    const prevTitle = document.title;
    const tag = document.querySelector('meta[name="description"]');
    const prevDesc = tag?.getAttribute("content") ?? "";

    document.title = title;
    tag?.setAttribute("content", description);

    return () => {
      document.title = prevTitle;
      tag?.setAttribute("content", prevDesc);
    };
  }, [title, description]);
}
