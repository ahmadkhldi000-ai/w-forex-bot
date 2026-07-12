/**
 * Returns the configured basePath from Next.js config.
 * Use for raw <a> tags that bypass next/link (which adds basePath automatically).
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Prepends the basePath to an internal path.
 * @example withBase("/dashboard") => "/w-forex-bot/dashboard" (when basePath set)
 */
export function withBase(path: string): string {
  if (!path.startsWith("/")) return path;
  if (BASE_PATH && path.startsWith(BASE_PATH)) return path;
  return `${BASE_PATH}${path}`;
}
