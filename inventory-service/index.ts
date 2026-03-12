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
  await consumer.subscribe({ topic: 'payment.success', fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());
      console.log('Received payment.success event', event);
      
      // Reduce stock
      await db.execute(sql`UPDATE products SET stock = stock - ${event.quantity} WHERE id = ${event.productId}`);
    }
  });

  const port = process.env.PORT || 3002;
  app.listen(port, () => console.log(`Inventory service running on port ${port}`));
};

start().catch(console.error);