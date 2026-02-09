import type { NextFunction, Request, Response } from "express";
import { getAdminAuth } from "../firebaseAdmin.js";

export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    res.status(401).json({ error: "Missing auth token" });
    return;
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    res.locals.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid auth token" });
  }
}
