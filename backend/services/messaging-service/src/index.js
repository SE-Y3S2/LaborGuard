const express = require('express');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');
const cors = require('cors');

const app = express();
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 3005;
const SERVICE_NAME = process.env.SERVICE_NAME || 'messaging-service';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/laborguard';
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';

// MongoDB Connection
const connectMongoDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log(`[${SERVICE_NAME}] Connected to MongoDB`);
    } catch (error) {
        console.error(`[${SERVICE_NAME}] MongoDB connection error:`, error.message);
        setTimeout(connectMongoDB, 5000);
    }
};

// Kafka Setup
const kafka = new Kafka({
    clientId: SERVICE_NAME,
    brokers: [KAFKA_BROKER],
    retry: {
        initialRetryTime: 1000,
        retries: 10
    }
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: `${SERVICE_NAME}-group` });

const connectKafka = async () => {
    try {
        await producer.connect();
        console.log(`[${SERVICE_NAME}] Kafka producer connected`);

        await consumer.connect();
        console.log(`[${SERVICE_NAME}] Kafka consumer connected`);

        // Subscribe to relevant topics
        await consumer.subscribe({ topic: 'messaging-events', fromBeginning: false });

        // Start consuming messages
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const msgValue = message.value.toString();
                console.log(`[${SERVICE_NAME}] Received message from ${topic}:`, msgValue);
                // Notification service handles the messaging-events, this is just for logging/extensibility here
            }
        });
    } catch (error) {
        console.error(`[${SERVICE_NAME}] Kafka connection error:`, error.message);
        setTimeout(connectKafka, 5000);
    }
};

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: SERVICE_NAME,
        timestamp: new Date().toISOString()
    });
});

// Root Endpoint
app.get('/', (req, res) => {
    res.json({
        service: SERVICE_NAME,
        description: 'Actor-to-Actor Messaging Service',
        version: '1.0.0'
    });
});

// Routes
const messageRoutes = require('./routes/messageRoutes');
app.use('/api', messageRoutes);

const messageRoutes = require('./routes/messageRoutes');

app.use((req, res, next) => {
    req.producer = producer;
    next();
});

app.use('/api/messages', messageRoutes);

// Start server
const startServer = async () => {
    await connectMongoDB();

    // Connect to Kafka but don't block server startup if it fails initially
    connectKafka().catch(err => {
        console.error(`[${SERVICE_NAME}] Kafka initial connection failed, will retry:`, err.message);
    });

    app.listen(PORT, () => {
        console.log(`[${SERVICE_NAME}] Server running on port ${PORT}`);
    });
};

startServer();
