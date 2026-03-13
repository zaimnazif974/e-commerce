import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'payment-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
  retry: {
    initialRetryTime: 1000,
    retries: 30
  }
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'payment-group' });

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

  await producer.connect();
  await consumer.connect();
  console.log('Payment Service connected to Kafka (Producer & Consumer)');
};
