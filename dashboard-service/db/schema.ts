import { pgTable, serial, varchar, timestamp, numeric, integer } from 'drizzle-orm/pg-core';

export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  eventType: varchar('event_type').notNull(), // order.created, payment.success
  orderId: integer('order_id').notNull(),
  userId: integer('user_id'),
  amount: numeric('amount').notNull(),
  productId: integer('product_id'),
  timestamp: timestamp('timestamp').defaultNow(),
});
