import { pgTable, serial, integer, varchar, numeric, timestamp } from 'drizzle-orm/pg-core';

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull(),
  amount: numeric('amount').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'), // PENDING, SUCCESS, FAILED
  paymentMethod: varchar('payment_method', { length: 100 }).notNull().default('NONE'),
  createdAt: timestamp('created_at').defaultNow(),
});
