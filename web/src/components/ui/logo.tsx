import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

export type LogoVariant = "full" | "compact" | "icon";

export interface LogoProps {
  /** Visual variant of the logo */
  variant?: LogoVariant;
  /** Pixel height — width auto-scales to preserve aspect ratio */
  height?: number;
  /** Optional className passthrough */
  className?: string;
  /** Priority loading (for above-the-fold usage like navbar) */
  priority?: boolean;
  /** Alt text override */
  alt?: string;
}

const ALT = "WForexBot";

/**
 * Unified brand logo for WForexBot.
 *
 * Variants:
 *  - "full"    → horizontal wordmark (navbar, footer, auth)
 *  - "compact" → small horizontal lockup (sidebar)
 *  - "icon"    → square mark only (favicon, social, mobile)
 *
 * Uses optimized PNGs from /public (next/image handles CDN + lazy load).
 */
export function Logo({
  variant = "full",
  height = 36,
  className,
  priority = false,
  alt = ALT,
}: LogoProps) {
  const src =
    variant === "icon"
      ? "/logo-icon.png"
      : variant === "compact"
        ? "/logo-sm.png"
        : "/logo.png";

  const aspect = variant === "icon" ? 1 : 520 / 366;
  const width = Math.round(height * aspect);

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn("inline-block select-none", className)}
      style={{ height: "auto", width: "auto", maxHeight: height }}
      unoptimized
    />
  );
}
