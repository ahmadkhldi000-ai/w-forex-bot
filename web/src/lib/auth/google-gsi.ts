/**
 * Google Identity Services (GIS) — client-side Google Sign-In.
 *
 * This is the official, modern Google sign-in that runs entirely in the browser
 * (no backend needed). After the user picks a Google account, Google returns a
 * signed JWT `credential` containing their email, name, and avatar.
 *
 * Docs: https://developers.google.com/identity/gsi/web/guides/overview
 *
 * Setup:
 *   1. https://console.cloud.google.com → APIs & Services → Credentials
 *   2. Create OAuth 2.0 Client ID (Web application)
 *   3. Add Authorized JavaScript origin: https://wforexbot.vercel.app
 *   4. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in Vercel env vars
 */

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export interface GoogleProfile {
  sub: string; // stable google id
  email: string;
  email_verified: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture: string;
  locale?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with";
              shape?: "rectangular" | "pill" | "circle" | "standard";
              width?: number;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const SCRIPT_ID = "wfb-google-gis";
let scriptPromise: Promise<void> | null = null;

/** Load the GIS script once. */
export function loadGoogleScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.google?.accounts?.id) return resolve();

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("load error")));
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("failed to load Google script"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/** Decode the Google credential JWT (client-side, for reading profile info). */
export function decodeGoogleCredential(credential: string): GoogleProfile | null {
  try {
    const payload = credential.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as GoogleProfile;
  } catch {
    return null;
  }
}

/** Is Google Sign-In configured (client ID present)? */
export function isGoogleConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID);
}
