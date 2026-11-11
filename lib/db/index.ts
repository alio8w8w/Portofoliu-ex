import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const globalForDatabase = globalThis as typeof globalThis & {
  portfolioPool?: Pool
}

export const pool = globalForDatabase.portfolioPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
})

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.portfolioPool = pool
}

export const db = drizzle(pool, { schema })
