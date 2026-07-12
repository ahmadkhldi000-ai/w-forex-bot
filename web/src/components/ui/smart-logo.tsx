"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo, type LogoProps } from "./logo";
import { getSession, type Session } from "@/lib/auth/account-store";

/**
 * SmartLogo — a logo that routes intelligently:
 *  • If the user is logged in → goes to /dashboard
 *  • If not logged in          → goes to / (marketing landing)
 *
 * Used across the navbar, footer, and dashboard sidebars so a single click on
 * the brand always takes the signed-in user to their control panel.
 */
export function SmartLogo({ height = 34, variant, priority, className }: LogoProps) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(getSession() !== null);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(authed ? "/dashboard" : "/");
  };

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      href={authed ? "/dashboard" : "/"}
      onClick={handleClick}
      className="flex cursor-pointer items-center gap-2.5 outline-none"
      aria-label={authed ? "Dashboard" : "Home"}
    >
      <Logo height={height} variant={variant} priority={priority} className={className} />
    </a>
  );
}

/** Re-export Session type for convenience */
export type { Session };
