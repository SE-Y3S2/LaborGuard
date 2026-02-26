const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { emitEvent } = require('../utils/kafkaProducer');
const { uploadToCloudinary } = require('../utils/cloudinaryConfig');
const { publishToChannel } = require('../utils/centrifugoClient');

const createConversation = async (req, res) => {
    try {
        const { participants, participantRoles, isGroup, groupName } = req.body;

        if (!participants || participants.length < 2) {
            return res.status(400).json({ error: 'At least 2 participants required' });
        }

        if (!isGroup) {
            // Check if a 1-on-1 conversation already exists
            const existingConversation = await Conversation.findOne({
                isGroup: false,
                participants: { $all: participants, $size: participants.length }
            });

            if (existingConversation) {
                return res.status(200).json(existingConversation);
            }
        }

        const newConversation = new Conversation({
            participants,
            participantRoles,
            isGroup: isGroup || false,
            groupName: groupName || ''
        });

        await newConversation.save();
        res.status(201).json(newConversation);
    } catch (error) {
        console.error('Error in createConversation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getConversations = async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;

        const conversations = await Conversation.find({ participants: userId })
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error in getConversations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const page = parseInt(req.query.page) || 1;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 }) // Newest first for pagination
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error in getMessages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { conversationId, senderId, content } = req.body;

        if (!conversationId || !senderId || (!content && !(req.files && req.files.length > 0))) {
            return res.status(400).json({ error: 'conversationId, senderId, and content or media are required' });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        if (!conversation.participants.includes(senderId)) {
            return res.status(403).json({ error: 'Sender is not a participant in this conversation' });
        }

        // Handle media uploads via Cloudinary
        const mediaUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
            const results = await Promise.all(uploadPromises);
            mediaUrls.push(...results.map(result => result.secure_url));
        }

        const newMessage = new Message({
            conversationId,
            senderId,
            content: content || '',
            mediaUrls,
            readBy: [senderId]
        });

        await newMessage.save();

        let previewText = content ? content.substring(0, 50) + (content.length > 50 ? '...' : '') : 'Sent an attachment';

        // Update conversation's last message
        conversation.lastMessage = {
            senderId,
            content: previewText,
            timestamp: newMessage.createdAt
        };
        await conversation.save();

        // Determine recipients
        const recipientIds = conversation.participants.filter(id => id !== senderId);

        // Emit Kafka event for notifications
        await emitEvent('messaging-events', 'message_sent', {
            messageId: newMessage._id,
            conversationId: conversation._id,
            senderId,
            recipientIds,
            contentPreview: previewText,
            isGroup: conversation.isGroup,
            groupName: conversation.groupName
        });

        // Publish to Centrifugo for real-time delivery
        try {
            await publishToChannel(`chat:${conversationId}`, {
                type: 'new_message',
                message: newMessage
            });
        } catch (centrifugoErr) {
            console.error('Failed to publish to Centrifugo:', centrifugoErr.message);
            // We don't fail the request if Centrifugo fails
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const result = await Message.updateMany(
            { conversationId, readBy: { $ne: userId } },
            { $push: { readBy: userId } }
        );

        res.status(200).json({ message: 'Messages marked as read', modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error in markAsRead:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { senderId } = req.body;

        if (!senderId) {
            return res.status(400).json({ error: 'senderId is required' });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        if (message.senderId !== senderId) {
            return res.status(403).json({ error: 'You can only delete your own messages' });
        }

        await Message.findByIdAndDelete(messageId);

        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error in deleteMessage:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createConversation,
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    deleteMessage
};
