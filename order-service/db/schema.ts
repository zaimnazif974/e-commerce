import { pgTable, serial, integer, varchar, timestamp, numeric } from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  productId: integer('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  totalAmount: numeric('total_amount').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('WAITING_FOR_PAYMENT'), // WAITING_FOR_PAYMENT, PENDING, SUCCESS, FAILED, COMPLETE, CANCELLED, CANCELLED, FAILED_PAYMENT
  createdAt: timestamp('created_at').defaultNow(),
});
