import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'order-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
  retry: {
    initialRetryTime: 1000,
    retries: 30
  }
});

export const consumer = kafka.consumer({ groupId: 'order-group' });
export const producer = kafka.producer();

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
    console.log('Error creating topic or it already exists', error);
  }
  await admin.disconnect();

  await consumer.connect();
  await producer.connect();
  console.log('Order Service connected to Kafka (Producer & Consumer)');
};
