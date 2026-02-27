const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    authorId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    mediaUrls: [{
        type: String
    }],
    likes: [{
        type: String
    }],
    shareCount: {
        type: Number,
        default: 0
    },
    hashtags: [{
        type: String
    }],
    poll: {
        question: String,
        options: [{
            text: String,
            votes: [{ type: String }]
        }]
    },
    isReported: {
        type: Boolean,
        default: false
    },
    reportCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

postSchema.index({ createdAt: -1 });
postSchema.index({ hashtags: 1 });

module.exports = mongoose.model('Post', postSchema);
