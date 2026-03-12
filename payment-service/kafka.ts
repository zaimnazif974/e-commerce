import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'payment-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:29092']
});

export const producer = kafka.producer();

export const connectKafka = async () => {
  await producer.connect();
  console.log('Payment Service connected to Kafka (Producer)');
};
