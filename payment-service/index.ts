import express from 'express';
import cors from 'cors';
import { db } from './db';
import { payments } from './db/schema';
import { connectKafka, producer } from './kafka';
import { execSync } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/payments', async (req, res) => {
  try {
    const { orderId, amount, paymentMethod, userId, productId, quantity } = req.body;
    
    const isSuccess = Math.random() > 0.1; // 90% success rate
    
    if (!isSuccess) {
      return res.status(400).json({ error: 'Payment failed' });
    }

    const newPayment = await db.insert(payments).values({
      orderId,
      amount,
      paymentMethod,
      status: 'SUCCESS'
    }).returning();

    const payment = newPayment?.[0];
    if (!payment) {
      throw new Error('Failed to save payment record');
    }

    // Publish event
    await producer.send({
      topic: 'payment.success',
      messages: [
        { value: JSON.stringify({ orderId, amount, userId, productId, quantity, paymentId: payment.id }) }
      ]
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});

const start = async () => {
  try {
    console.log('Pushing schema to DB...');
    execSync('bunx drizzle-kit push', { stdio: 'inherit' });
    console.log('Payment DB Synced!');
  } catch (err) {
    console.error('Failed to push schema:', err);
  }

  await connectKafka();

  const port = process.env.PORT || 3003;
  app.listen(port, () => console.log(`Payment service running on port ${port}`));
};

start().catch(console.error);