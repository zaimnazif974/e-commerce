import { pgTable, serial, integer, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 100 }).notNull(), // e.g., PAYMENT_SUCCESS
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
