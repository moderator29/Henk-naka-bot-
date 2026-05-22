import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === "production") {
  throw new Error("DATABASE_URL is required in production");
}

const client = postgres(connectionString ?? "postgres://invalid", {
  prepare: false,
  max: 10,
});

export const db = drizzle(client, { schema });
export type DB = typeof db;
