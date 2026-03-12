import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'order-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:29092']
});

export const consumer = kafka.consumer({ groupId: 'order-group' });

export const connectKafka = async () => {
  const admin = kafka.admin();
  await admin.connect();
  try {
    await admin.createTopics({
      topics: [{ topic: 'payment.success', numPartitions: 1 }]
    });
    console.log('Topic payment.success ensured to exist');
  } catch (error) {
    console.log('Error creating topic or it already exists', error);
  }
  await admin.disconnect();

  await consumer.connect();
  console.log('Order Service connected to Kafka');
};
