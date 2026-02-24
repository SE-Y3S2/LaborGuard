const Message = require('../models/Message');
const cloudinary = require('../config/cloudinary');
const { messageSchema } = require('../validations/messageValidation');

// CREATE MESSAGE
exports.createMessage = async (req, res) => {
    try {
        const { error } = messageSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        let mediaUrl = null;

        // If image uploaded
        if (req.file) {
            const result = await cloudinary.uploader.upload_stream(
                { resource_type: "image" },
                async (error, result) => {}
            );
        }

        // Handle image properly
        if (req.file) {
            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
            );
            mediaUrl = result.secure_url;
        }

        const message = await Message.create({
            ...req.body,
            mediaUrl
        });

        // Send Kafka event
        await req.producer.send({
            topic: 'notification-events',
            messages: [{
                value: JSON.stringify({
                    type: 'NEW_MESSAGE',
                    receiverId: message.receiverId,
                    messageId: message._id
                })
            }]
        });

        res.status(201).json(message);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// READ ALL
exports.getAllMessages = async (req, res) => {
    const messages = await Message.find();
    res.json(messages);
};

// READ ONE
exports.getMessage = async (req, res) => {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Not found" });
    res.json(message);
};

// UPDATE
exports.updateMessage = async (req, res) => {
    const message = await Message.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.json(message);
};

// DELETE
exports.deleteMessage = async (req, res) => {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
};