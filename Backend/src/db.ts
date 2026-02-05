import pg from "pg";
const { Pool } = pg;

// Parse positive integer environment variable or fallback to default
const parsePositiveInt = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) {
    console.warn(`Invalid DB_MAX_CONNECTIONS="${value}" — falling back to ${fallback}`);
    return fallback;
  }
  return n;
};

const maxConnections = parsePositiveInt(process.env.DB_MAX_CONNECTIONS, 10);

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: maxConnections,
});
