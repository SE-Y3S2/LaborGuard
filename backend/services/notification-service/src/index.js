const express = require('express');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 3004;
const SERVICE_NAME = process.env.SERVICE_NAME || 'notification-service';
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
        await consumer.subscribe({ topic: 'notification-events', fromBeginning: false });
        await consumer.subscribe({ topic: 'messaging-events', fromBeginning: false });

        // Start consuming messages
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const msgValue = message.value.toString();
                console.log(`[${SERVICE_NAME}] Received message from ${topic}:`, msgValue);

                try {
                    const event = JSON.parse(msgValue);

                    if (topic === 'messaging-events' && event.type === 'message_sent') {
                        const { senderId, recipientIds, contentPreview, conversationId, isGroup, groupName } = event.payload;

                        // Import model inline to prevent circular dependency issues during initialization
                        const Notification = require('./models/Notification');
                        const { sendEmailNotification } = require('./utils/resendClient');

                        const title = isGroup ? `New message in ${groupName || 'Group'}` : `New message from user ${senderId}`;

                        // Create a notification for each recipient
                        const notifications = [];

                        for (const userId of recipientIds) {
                            notifications.push({
                                userId,
                                type: 'message',
                                title,
                                body: contentPreview,
                                relatedId: conversationId
                            });

                            // Send an email alert for this new message
                            // Note: In a production environment, we'd fetch the user's actual email from the DB here
                            await sendEmailNotification(
                                'user@example.com', // Placeholder
                                `LaborGuard: ${title}`,
                                `<p>You have a new message on LaborGuard!</p><p><strong>${title}</strong></p><p><i>"${contentPreview}"</i></p>`
                            );
                        }

                        if (notifications.length > 0) {
                            await Notification.insertMany(notifications);
                            console.log(`[${SERVICE_NAME}] Created ${notifications.length} message notifications and emitted emails`);
                        }
                    }
                } catch (err) {
                    console.error(`[${SERVICE_NAME}] Error processing message:`, err.message);
                }
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
        description: 'Notification Service',
        version: '1.0.0'
    });
});

// Routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

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
