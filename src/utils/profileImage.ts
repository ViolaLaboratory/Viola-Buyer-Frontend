/**
 * Normalize profile image URL from API response
 * Backend may return: full URL, /media/... path, or profile_images/...
 */

export function normalizeProfileImageUrl(apiValue: string | null | undefined): string {
  if (!apiValue) return "/viola-logo.jpg";
  const trimmed = apiValue.trim();
  if (!trimmed) return "/viola-logo.jpg";

  // Data URL (e.g. from local upload) - use as-is
  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Full URL (http/https) - use as-is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Relative path starting with / (e.g. /media/profile_images/xxx.jpg)
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Path like "profile_images/xxx" or "media/profile_images/xxx"
  return trimmed.startsWith("media/") ? `/${trimmed}` : `/media/${trimmed}`;
}
