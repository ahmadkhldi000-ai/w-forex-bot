import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import type { Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function success<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function error(
  res: Response,
  message: string,
  status = 400,
  details?: unknown
) {
  return res.status(status).json({ success: false, error: message, details });
}

export function handleError(res: Response, err: unknown) {
  if (err instanceof AppError) {
    return error(res, err.message, err.statusCode, err.details);
  }
  if (err instanceof ZodError) {
    return error(res, "Validation failed", 422, err.errors);
  }
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return error(res, "Resource already exists (duplicate)", 409);
    }
    if (err.code === "P2025") {
      return error(res, "Resource not found", 404);
    }
    return error(res, "Database error", 500, { code: err.code });
  }
  console.error("[unhandled]", err);
  return error(res, "Internal server error", 500);
}
