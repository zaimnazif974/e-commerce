import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'dashboard-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
  retry: {
    initialRetryTime: 1000,
    retries: 30
  }
});

export const consumer = kafka.consumer({ groupId: 'dashboard-group' });

export const connectKafka = async () => {
  const admin = kafka.admin();
  await admin.connect();
  try {
    await admin.createTopics({
      topics: [
        { topic: 'payment-events', numPartitions: 1 },
        { topic: 'order-events', numPartitions: 1 }
      ]
    });
    console.log('Topics ensured to exist');
  } catch (error) {
    console.log('Error creating topics or they already exist', error);
  }
  await admin.disconnect();

  await consumer.connect();
  console.log('Dashboard Service connected to Kafka');
};
