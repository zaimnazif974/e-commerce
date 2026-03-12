import { db } from './index';
import { products } from './schema';

const seedProducts = [
  {
    name: 'Classic Aviator Sunglasses',
    description: 'Timeless aviator design with polarized lenses for maximum UV protection.',
    price: '120.00',
    stock: 50
  },
  {
    name: 'Blue Light Blocking Glasses',
    description: 'Protect your eyes from digital screen glare with these stylish blue light blocking glasses.',
    price: '45.50',
    stock: 200
  },
  {
    name: 'Retro Round Optical Frames',
    description: 'Vintage-inspired round frames suitable for prescription lenses. Comfortable and lightweight.',
    price: '85.00',
    stock: 75
  },
  {
    name: 'Sport Wrap-Around Sunglasses',
    description: 'Durable and secure wrap-around sunglasses perfect for outdoor sports and activities.',
    price: '65.00',
    stock: 30
  },
  {
    name: 'Designer Cat-Eye Glasses',
    description: 'Elegant cat-eye frames that add a touch of sophistication to any outfit.',
    price: '150.00',
    stock: 15
  }
];

async function seed() {
  console.log('Seeding inventory products...');
  try {
    for (const product of seedProducts) {
      await db.insert(products).values(product);
    }
    console.log('Inventory products seeded successfully!');
  } catch (error) {
    console.error('Error seeding inventory products:', error);
  } finally {
    process.exit(0);
  }
}

seed();
