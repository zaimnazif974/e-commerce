import express from 'express';
import cors from 'cors';
import { db } from './db';
import { products } from './db/schema';
import { connectKafka, consumer } from './kafka';
import { eq, sql } from 'drizzle-orm';
import { execSync } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/products', async (req, res) => {
  try {
    const list = await db.select().from(products);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});

app.post('/products', async (req, res) => {
  try {
    const newProduct = await db.insert(products).values(req.body).returning();
    res.status(201).json(newProduct[0]);
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});

app.post('/api/inventory/:id/decrease', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { quantity } = req.body;
    
    // Check current stock
    const product = await db.select().from(products).where(eq(products.id, productId));
    if (!product.length || product[0].stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock or product not found' });
    }
    
    // Decrease stock
    const updatedProduct = await db.execute(sql`UPDATE products SET stock = stock - ${quantity} WHERE id = ${productId} RETURNING *`);
    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
});

const start = async () => {
  try {
    console.log('Pushing schema to DB...');
    execSync('bunx drizzle-kit push', { stdio: 'inherit' });
    console.log('Inventory DB Synced!');
  } catch (err) {
    console.error('Failed to push schema:', err);
  }

  // Seed default products if empty
  try {
    const count = await db.select({ count: sql<number>`count(*)` }).from(products);
    if (!count[0] || count[0].count == 0) {
      await db.insert(products).values([
        { name: 'Laptop', description: 'Gaming Laptop', price: '1500.00', stock: 10 },
        { name: 'Mouse', description: 'Wireless Mouse', price: '25.00', stock: 50 },
        { name: 'Keyboard', description: 'Mechanical Keyboard', price: '75.00', stock: 20 },
      ]);
      console.log('Seeded products database');
    }
  } catch (err) {
    console.error('Failed to seed DB:', err);
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
        // Removed asynchronous stock reduction
      } else if (topic === 'order-events' && payload.type === 'order.cancelled') {
        const event = payload.data;
        console.log('Received order.cancelled event, restoring stock', event);
        try {
          await db.execute(sql`UPDATE products SET stock = stock + ${event.quantity} WHERE id = ${event.productId}`);
          console.log(`Restored ${event.quantity} stock for product ${event.productId}`);
        } catch (err) {
          console.error('Failed to restore stock', err);
        }
      }
    }
  });

  const port = process.env.PORT || 3002;
  app.listen(port, () => console.log(`Inventory service running on port ${port}`));
};

start().catch(console.error);