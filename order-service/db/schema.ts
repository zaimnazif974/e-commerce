import { pgTable, serial, integer, varchar, timestamp, numeric } from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  productId: integer('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  totalAmount: numeric('total_amount').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'), // PENDING, PAID, CANCELLED, FAILED_PAYMENT
  createdAt: timestamp('created_at').defaultNow(),
});
