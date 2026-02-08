const corsOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

export const env = {
  port: Number(process.env.PORT ?? 8080),
  corsOrigins,
};
