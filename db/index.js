import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pool } from '../index.mjs';

export const db = drizzle(pool);
