import { Router, type Request, type Response } from "express";
import { prisma } from "@/config/db.js";
import { config } from "@/config/env.js";
import { signUserToken, getClientIp } from "@/utils/crypto.js";
import { handleError, AppError } from "@/utils/errors.js";
import { auditLog } from "@/middleware/audit.js";

const router = Router();

// Google OAuth endpoints. Documents: https://developers.google.com/identity/protocols/oauth2/web-server
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

// Scopes: openid + email + profile (minimal, read-only)
const SCOPES = ["openid", "email", "profile"].join(" ");

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface GoogleUserInfo {
  sub: string; // stable Google user id
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

/**
 * Step 1 — Redirect the user to Google's consent screen.
 * Frontend calls GET /api/auth/google → 302 to accounts.google.com.
 *
 * Optional `?mode=register` query is passed through `state` so we can later
 * distinguish sign-up from sign-in.
 */
router.get("/google", (req: Request, res: Response) => {
  if (!config.google.clientId) {
    throw new AppError(
      500,
      "تسجيل الدخول عبر جوجل غير مُفعّل — GOOGLE_CLIENT_ID غير مُعدّ"
    );
  }

  const mode = req.query.mode === "register" ? "register" : "login";
  const state = Buffer.from(JSON.stringify({ mode })).toString("base64url");

  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: config.google.redirectUrl,
    response_type: "code",
    scope: SCOPES,
    access_type: "online", // no refresh token needed (we issue our own JWT)
    include_granted_scopes: "true",
    prompt: "select_account", // always let the user pick an account
    state,
  });

  return res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
});

/**
 * Step 2 — Google redirects back here with ?code=...
 * We exchange the code for tokens, fetch the user profile, upsert the user,
 * issue our own JWT, then redirect to the frontend with ?token=...&firstLogin=...
 */
router.get("/google/callback", async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string | undefined;
    const errorParam = req.query.error as string | undefined;

    // User denied consent or an error occurred
    if (errorParam || !code) {
      return res.redirect(
        `${config.google.frontendUrl}/auth?google_error=access_denied`
      );
    }

    if (!config.google.clientId || !config.google.clientSecret) {
      throw new AppError(
        500,
        "Google OAuth غير مُهيأ بشكل صحيح على الخادم"
      );
    }

    // --- Exchange authorization code for access token ---
    const tokenBody = new URLSearchParams({
      code,
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      redirect_uri: config.google.redirectUrl,
      grant_type: "authorization_code",
    });

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody.toString(),
    });

    if (!tokenRes.ok) {
      const detail = await tokenRes.text();
      console.error("[google] token exchange failed:", detail);
      return res.redirect(
        `${config.google.frontendUrl}/auth?google_error=token_exchange`
      );
    }

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;

    // --- Fetch user profile from Google ---
    const userRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      console.error("[google] userinfo fetch failed:", userRes.status);
      return res.redirect(
        `${config.google.frontendUrl}/auth?google_error=userinfo`
      );
    }

    const profile = (await userRes.json()) as GoogleUserInfo;

    if (!profile.email || !profile.email_verified) {
      return res.redirect(
        `${config.google.frontendUrl}/auth?google_error=email_not_verified`
      );
    }

    const ip = getClientIp(req);
    req.clientIp = ip;

    // --- Upsert user: link if exists, create if new ---
    // Lookup by (provider=GOOGLE, providerId=sub) first, then by email.
    let user = await prisma.user.findFirst({
      where: {
        provider: "GOOGLE",
        providerId: profile.sub,
      },
    });

    let isFirstLogin = false;

    if (!user) {
      // Check if an email/password account already uses this email
      const existingByEmail = await prisma.user.findUnique({
        where: { email: profile.email.toLowerCase() },
      });

      if (existingByEmail) {
        // Link the existing account to Google (merge identities)
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            provider: "GOOGLE",
            providerId: profile.sub,
            avatarUrl: profile.picture ?? existingByEmail.avatarUrl,
            name: existingByEmail.name ?? profile.name,
            emailVerified: true,
            status: existingByEmail.status === "PENDING" ? "ACTIVE" : existingByEmail.status,
          },
        });
      } else {
        // Brand new account via Google
        isFirstLogin = true;
        user = await prisma.user.create({
          data: {
            email: profile.email.toLowerCase(),
            name: profile.name,
            avatarUrl: profile.picture,
            provider: "GOOGLE",
            providerId: profile.sub,
            emailVerified: true,
            status: "ACTIVE",
            riskAccepted: true, // OAuth users proceed; they'll accept risk in-app
            riskAcceptedAt: new Date(),
            riskAcceptedIp: ip,
            lastLoginAt: new Date(),
            lastLoginIp: ip,
          },
        });
      }
    } else {
      // Returning Google user — refresh avatar/name + login metadata
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatarUrl: profile.picture ?? user.avatarUrl,
          name: user.name ?? profile.name,
          lastLoginAt: new Date(),
          lastLoginIp: ip,
        },
      });
    }

    await auditLog(req, {
      action: isFirstLogin ? "REGISTER" : "LOGIN",
      resource: "user",
      resourceId: user.id,
      details: { method: "google", googleSub: profile.sub },
    });

    // --- Issue our own JWT ---
    const token = signUserToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Redirect to frontend callback with token in the query string.
    // The frontend /auth/google/callback page reads it and stores it.
    const redirect = new URL("/auth/google/callback", config.google.frontendUrl);
    redirect.searchParams.set("token", token);
    redirect.searchParams.set("firstLogin", isFirstLogin ? "1" : "0");
    return res.redirect(redirect.toString());
  } catch (err) {
    console.error("[google/callback] error:", err);
    return res.redirect(
      `${config.google.frontendUrl}/auth?google_error=server`
    );
  }
});

// Wrap async route errors through handleError for consistency
router.use((err: unknown, _req: Request, res: Response) => {
  void handleError(res, err);
});

export default router;
