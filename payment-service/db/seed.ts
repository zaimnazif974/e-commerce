import { db } from './index';
import { payments } from './schema';

const seedPayments = [
  {
    orderId: 101,
    amount: '120.00',
    status: 'SUCCESS',
    paymentMethod: 'Credit Card'
  },
  {
    orderId: 102,
    amount: '45.50',
    status: 'SUCCESS',
    paymentMethod: 'PayPal'
  },
  {
    orderId: 103,
    amount: '85.00',
    status: 'FAILED',
    paymentMethod: 'Credit Card'
  },
  {
    orderId: 104,
    amount: '65.00',
    status: 'SUCCESS',
    paymentMethod: 'Debit Card'
  },
  {
    orderId: 105,
    amount: '150.00',
    status: 'SUCCESS',
    paymentMethod: 'Bank Transfer'
  }
];

async function seed() {
  console.log('Seeding payment records...');
  try {
    for (const payment of seedPayments) {
      await db.insert(payments).values(payment);
    }
    console.log('Payment records seeded successfully!');
  } catch (error) {
    console.error('Error seeding payment records:', error);
  } finally {
    process.exit(0);
  }
}

seed();
