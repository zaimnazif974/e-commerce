import { pgTable, serial, integer, varchar, text, numeric, timestamp } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price').notNull(),
  stock: integer('stock').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});
