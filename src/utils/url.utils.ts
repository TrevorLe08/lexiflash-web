/**
 * URL Sanitization Utility
 * Mitigates XSS vectors from untrusted user/database links (e.g. javascript:, data:, vbscript:).
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url) return "#";
  const trimmed = url.trim();

  // Internal relative path
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return trimmed;
  }

  // Check valid safe web protocols
  try {
    const parsed = new URL(trimmed, "https://lexiflash.app");
    const protocol = parsed.protocol.toLowerCase();
    if (
      protocol === "http:" ||
      protocol === "https:" ||
      protocol === "mailto:"
    ) {
      return trimmed;
    }
  } catch {
    // Malformed URL
    return "#";
  }

  return "#";
}
