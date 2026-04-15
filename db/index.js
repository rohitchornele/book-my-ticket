import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pool } from '../index.mjs';
import pg from 'pg';


export const db = drizzle(
    new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    })
);
