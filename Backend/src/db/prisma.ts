import { PrismaClient } from "@prisma/client";

const buildDatabaseUrl = () => {
  const name = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const instance = process.env.INSTANCE_CONNECTION_NAME;
  if (!name || !user || !password || !instance) return null;

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);
  return `postgresql://${encodedUser}:${encodedPassword}@/${name}?host=/cloudsql/${instance}`;
};

if (!process.env.DATABASE_URL) {
  const url = buildDatabaseUrl();
  if (url) process.env.DATABASE_URL = url;
}

export const prisma = new PrismaClient();
