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
        type: String // URLs for pictures/videos
    }],
    likes: [{
        type: String // userIds
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
            votes: [{ type: String }] // Array of userIds who voted for this option
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

// Index for getting feeds ordered by creation date
postSchema.index({ createdAt: -1 });
// Index for hashtag search
postSchema.index({ hashtags: 1 });

module.exports = mongoose.model('Post', postSchema);
