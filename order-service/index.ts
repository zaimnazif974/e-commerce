import express from 'express';
import cors from 'cors';
import { db } from './db';
import { orders } from './db/schema';
import { connectKafka, consumer } from './kafka';
import { eq } from 'drizzle-orm';
import { execSync } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/orders', async (req, res) => {
  try {
    const { userId, productId, quantity, totalAmount } = req.body;
    const newOrder = await db.insert(orders).values({
      userId,
      productId,
      quantity,
      totalAmount,
    }).returning();
    res.status(201).json(newOrder[0]);
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});

app.get('/orders/:userId', async (req, res) => {
  try {
    const userOrders = await db.select().from(orders).where(eq(orders.userId, parseInt(req.params.userId)));
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});

const start = async () => {
  try {
    console.log('Pushing schema to DB...');
    execSync('bunx drizzle-kit push', { stdio: 'inherit' });
    console.log('Order DB Synced!');
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
      
      // Update order status
      await db.update(orders)
        .set({ status: 'PAID' })
        .where(eq(orders.id, event.orderId));
    }
  });

  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`Order service running on port ${port}`));
};

start().catch(console.error);