import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://ecommerce_user:ecommerce_password@localhost:15004/ecommerce_db'
});

export const db = drizzle(pool);
