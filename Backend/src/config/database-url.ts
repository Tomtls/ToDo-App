// Shared by Prisma CLI config and runtime to build DATABASE_URL consistently.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function buildDatabaseUrlFromEnv(): string {
  const name = requireEnv("DB_NAME");
  const user = requireEnv("DB_USER");
  const password = requireEnv("DB_PASSWORD");
  const host = requireEnv("DB_HOST");
  const port = process.env.DB_PORT?.trim() || "5432";

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);

  return `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${name}`;
}

export function ensureDatabaseUrlEnv(): string {
  const existing = process.env.DATABASE_URL;

  if (existing && existing.trim().length > 0) 
    return existing.trim();

  const url = buildDatabaseUrlFromEnv();
  process.env.DATABASE_URL = url;
  return url;
}

