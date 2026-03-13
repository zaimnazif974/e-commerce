import express from 'express';
import cors from 'cors';
import { db } from './db';
import { orders } from './db/schema';
import { connectKafka, consumer, producer } from './kafka';
import { eq } from 'drizzle-orm';
import { execSync } from 'child_process';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/orders', async (req, res) => {
  try {
    const { userId, productId, quantity, totalAmount } = req.body;
    
    // Synchronously reduce stock
    const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3002';
    await axios.post(`${inventoryUrl}/api/inventory/${productId}/decrease`, { quantity });

    const newOrder = await db.insert(orders).values({
      userId,
      productId,
      quantity,
      totalAmount,
      status: 'WAITING_FOR_PAYMENT'
    }).returning();
    
    const order = newOrder[0];
    if (!order) {
      throw new Error("Failed to insert order");
    }
    
    // Publish event
    await producer.send({
      topic: 'order-events',
      messages: [
        { value: JSON.stringify({ type: 'order.created', data: { orderId: order.id, amount: totalAmount, userId, productId, quantity } }) }
      ]
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: (error as any).message || (error as any).response?.data?.error || 'Order creation failed' });
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

app.patch('/orders/:id/cancel', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const existingOrder = await db.select().from(orders).where(eq(orders.id, orderId));
    
    if (!existingOrder.length) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (existingOrder[0].status !== 'WAITING_FOR_PAYMENT' && existingOrder[0].status !== 'PENDING') {
      return res.status(400).json({ error: 'Order cannot be cancelled in its current state' });
    }

    const updated = await db.update(orders)
      .set({ status: 'CANCELLED' })
      .where(eq(orders.id, orderId))
      .returning();
      
    if (!updated || updated.length === 0) {
      return res.status(500).json({ error: 'Failed to update order status' });
    }
      
    // Publish order.cancelled event
    await producer.send({
      topic: 'order-events',
      messages: [
        { 
          value: JSON.stringify({ 
            type: 'order.cancelled', 
            data: { 
              orderId, 
              productId: updated[0].productId, 
              quantity: updated[0].quantity,
              userId: updated[0].userId,
              amount: updated[0].totalAmount
            } 
          }) 
        }
      ]
    });

    res.json(updated[0]);
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
  await consumer.subscribe({ topic: 'payment-events', fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const payload = JSON.parse(message.value.toString());
      
      if (payload.type === 'payment.success') {
        const event = payload.data;
        console.log('Received payment.success event', event);
        
        // Update order status
        await db.update(orders)
          .set({ status: 'COMPLETE' })
          .where(eq(orders.id, event.orderId));
      }
    }
  });

  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`Order service running on port ${port}`));
};

start().catch(console.error);