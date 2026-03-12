import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://ecommerce_user:ecommerce_password@localhost:5432/inventory_db',
});

export const db = drizzle(pool, { schema });
