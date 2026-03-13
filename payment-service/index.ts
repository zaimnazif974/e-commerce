import express from 'express';
import cors from 'cors';
import { db } from './db';
import { payments } from './db/schema';
import { connectKafka, producer, consumer } from './kafka';
import { eq } from 'drizzle-orm';
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

    // Update existing payment instead of insert
    const updatedPayment = await db.update(payments)
      .set({ 
        amount,
        paymentMethod,
        status: 'SUCCESS' 
      })
      .where(eq(payments.orderId, orderId))
      .returning();

    const payment = updatedPayment?.[0];
    if (!payment) {
      throw new Error('Failed to find or update payment record');
    }

    // Publish event
    await producer.send({
      topic: 'payment-events',
      messages: [
        { value: JSON.stringify({ type: 'payment.success', data: { orderId, amount, userId, productId, quantity, paymentId: payment.id } }) }
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
  
  await consumer.subscribe({ topic: 'order-events', fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const payload = JSON.parse(message.value.toString());
      
      if (payload.type === 'order.created') {
        const event = payload.data;
        console.log('Received order.created event', event);
        
        try {
          await db.insert(payments).values({
            orderId: event.orderId,
            amount: event.amount,
            status: 'PENDING'
          });
          console.log(`Created PENDING payment for order ${event.orderId}`);
        } catch (err) {
          console.error('Failed to create pending payment', err);
        }
      }
    }
  });

  const port = process.env.PORT || 3003;
  app.listen(port, () => console.log(`Payment service running on port ${port}`));
};

start().catch(console.error);