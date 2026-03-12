import { pgTable, serial, integer, varchar, numeric, timestamp } from 'drizzle-orm/pg-core';

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull(),
  amount: numeric('amount').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('SUCCESS'), // SUCCESS, FAILED
  paymentMethod: varchar('payment_method', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
