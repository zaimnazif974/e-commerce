import express from 'express';
import cors from 'cors';
import { db } from './db/index.js';
import { analytics } from './db/schema.js';
import { connectKafka, consumer } from './kafka.js';
import { execSync } from 'child_process';
import { sql, eq } from 'drizzle-orm';

const app = express();
app.use(cors());
app.use(express.json());

// Analytics endpoints (Protected by Admin - handled in frontend or via simple middleware in real app)
app.get('/api/analytics/sales', async (req: express.Request, res: express.Response) => {
  try {
    const list = await db.select().from(analytics);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});

app.get('/api/analytics/summary', async (req: express.Request, res: express.Response) => {
  try {
    const ordersCount = await db.select({ count: sql<number>`count(*)` }).from(analytics).where(eq(analytics.eventType, 'order.created'));
    const salesTotal = await db.select({ total: sql<number>`sum(${analytics.amount})` }).from(analytics).where(eq(analytics.eventType, 'payment.success'));
    
    // Nivo bar / pie data shapes can be mapped on frontend, we return raw counts
    res.json({
      totalOrders: Number(ordersCount[0]?.count) || 0,
      totalSales: Number(salesTotal[0]?.total) || 0
    });
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});

const start = async () => {
  try {
    console.log('Pushing schema to DB...');
    execSync('bunx drizzle-kit push', { stdio: 'inherit' });
    console.log('Dashboard DB Synced!');
  } catch (err) {
    console.error('Failed to push schema:', err);
  }

  await connectKafka();
  
  await consumer.subscribe({ topic: 'order-events', fromBeginning: false });
  await consumer.subscribe({ topic: 'payment-events', fromBeginning: false });
  
  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;
      const payload = JSON.parse(message.value.toString());
      
      console.log(`Dashboard Service received ${topic} event`, payload);
      
      try {
        if (payload.type === 'order.created' || payload.type === 'payment.success' || payload.type === 'order.cancelled') {
          const event = payload.data;
          await db.insert(analytics).values({
            eventType: payload.type,
            orderId: event.orderId,
            userId: event.userId,
            amount: event.amount,
            productId: event.productId || null
          });
        }
      } catch (err) {
        console.error('Error saving analytics event', err);
      }
    }
  });

  const port = process.env.PORT || 3005;
  app.listen(port, () => console.log(`Dashboard service running on port ${port}`));
};

start().catch(console.error);
