import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { config } from "@/config/env.js";

// --------------------------------------------------------------------
//  PASSWORD HASHING
// --------------------------------------------------------------------

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// --------------------------------------------------------------------
//  AES-256 ENCRYPTION (for MT5 passwords, secrets at rest)
// --------------------------------------------------------------------

const ALGO = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

function getKey(): Buffer {
  const hex = config.encryption.key;
  const key = Buffer.from(hex, "hex");
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be ${KEY_LENGTH} bytes (got ${key.length})`);
  }
  return key;
}

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  // format: iv:authTag:encrypted (all hex)
  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decrypt(payload: string): string {
  const [ivHex, authTagHex, dataHex] = payload.split(":");
  if (!ivHex || !authTagHex || !dataHex) throw new Error("Invalid encrypted payload");
  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

// --------------------------------------------------------------------
//  JWT
// --------------------------------------------------------------------

export interface UserJwtPayload {
  sub: string;       // user id
  email: string;
  role: string;
  type: "user";
}

export interface AdminJwtPayload {
  sub: string;       // admin id
  email: string;
  role: string;      // AdminRole
  permissions: string[];
  type: "admin";
}

export function signUserToken(payload: Omit<UserJwtPayload, "type">): string {
  return jwt.sign({ ...payload, type: "user" }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

export function signAdminToken(payload: Omit<AdminJwtPayload, "type">): string {
  return jwt.sign({ ...payload, type: "admin" }, config.jwt.adminSecret, {
    expiresIn: config.jwt.adminExpiresIn,
  } as jwt.SignOptions);
}

export function verifyUserToken(token: string): UserJwtPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as UserJwtPayload;
    return decoded.type === "user" ? decoded : null;
  } catch {
    return null;
  }
}

export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.adminSecret) as AdminJwtPayload;
    return decoded.type === "admin" ? decoded : null;
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------
//  MISC
// --------------------------------------------------------------------

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function getClientIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }): string {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string") return xf.split(",")[0].trim();
  return req.socket?.remoteAddress ?? "unknown";
}
