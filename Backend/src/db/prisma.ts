import { PrismaClient } from "@prisma/client";
import { ensureDatabaseUrlEnv } from "../config/database-url.js";

const url = ensureDatabaseUrlEnv();

export const prisma = new PrismaClient({datasources: { db: { url } }});
