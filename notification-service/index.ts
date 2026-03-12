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
  await consumer.subscribe({ topic: 'payment.success', fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());
      console.log('Received payment.success event', event);
      
      // Create notification
      await db.insert(notifications).values({
        userId: event.userId,
        message: `Your payment of $${event.amount} for order #${event.orderId} was successful!`,
        type: 'PAYMENT_SUCCESS',
      });
    }
  });

  const port = process.env.PORT || 3004;
  app.listen(port, () => console.log(`Notification service running on port ${port}`));
};

start().catch(console.error);