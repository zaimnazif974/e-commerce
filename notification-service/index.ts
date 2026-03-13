import express from 'express';
import cors from 'cors';
import { db } from './db';
import { notifications } from './db/schema';
import { connectKafka, consumer } from './kafka';
import { eq } from 'drizzle-orm';
import { execSync } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/notifications/:userId', async (req, res) => {
  try {
    const userNotifications = await db.select().from(notifications).where(eq(notifications.userId, parseInt(req.params.userId)));
    res.json(userNotifications);
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});

const start = async () => {
  try {
    console.log('Pushing schema to DB...');
    execSync('bunx drizzle-kit push', { stdio: 'inherit' });
    console.log('Notification DB Synced!');
  } catch (err) {
    console.error('Failed to push schema:', err);
  }

  await connectKafka();
  await consumer.subscribe({ topic: 'payment-events', fromBeginning: false });
  await consumer.subscribe({ topic: 'order-events', fromBeginning: false });
  
  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;
      const payload = JSON.parse(message.value.toString());
      
      if (topic === 'payment-events' && payload.type === 'payment.success') {
        const event = payload.data;
        console.log('Received payment.success event', event);
        await db.insert(notifications).values({
          userId: event.userId,
          message: `Your payment of $${event.amount} for order #${event.orderId} was successful!`,
          type: 'PAYMENT_SUCCESS',
        });
      } else if (topic === 'order-events' && payload.type === 'order.created') {
        const event = payload.data;
        console.log('Received order.created event', event);
        await db.insert(notifications).values({
          userId: event.userId,
          message: `Order #${event.orderId} created for $${event.amount}. Please complete your payment.`,
          type: 'WAITING_PAYMENT',
        });
      } else if (topic === 'order-events' && payload.type === 'order.cancelled') {
        const event = payload.data;
        console.log('Received order.cancelled event', event);
        await db.insert(notifications).values({
          userId: event.userId,
          message: `Order #${event.orderId} was cancelled successfully.`,
          type: 'ORDER_CANCELLED',
        });
      }
    }
  });

  const port = process.env.PORT || 3004;
  app.listen(port, () => console.log(`Notification service running on port ${port}`));
};

start().catch(console.error);