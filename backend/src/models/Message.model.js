const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ recipientId: 1, createdAt: -1 });
messageSchema.index({ classId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
