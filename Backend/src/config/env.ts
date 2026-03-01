const corsOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

export const env = {
  port: Number(process.env.PORT ?? 8080),
  corsOrigins,
  supabaseJwtIssuer: (process.env.SUPABASE_JWT_ISSUER ?? "").trim(),
};

export function isSupabaseAuthConfigured() {
  return env.supabaseJwtIssuer.length > 0;
}
