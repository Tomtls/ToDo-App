import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../config/env.js";

const issuer = env.supabaseJwtIssuer || undefined;
const jwks = issuer
  ? createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`))
  : null;

export async function verifySupabaseToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    res.status(401).json({ error: "Missing auth token" });
    return;
  }

  try {
    if (!jwks) {
      res.status(401).json({ error: "Auth not configured" });
      return;
    }

    const { payload } = await jwtVerify(token, jwks, { issuer, });

    const uid = typeof payload.sub === "string" ? payload.sub : undefined;
    res.locals.user = {
      uid,
      ...payload,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid auth token" });
  }
}
