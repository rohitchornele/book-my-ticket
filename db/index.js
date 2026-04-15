import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pool } from '../index.mjs';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool);
