import mongoose, { Document, Schema } from 'mongoose';
import { encryptMessage } from '../utils/encryption';
import { sanitizeMessage } from '../utils/messageFilter';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text: string;
  encryptedText?: string;
  isEncrypted: boolean;
  imageUrl?: string;
  isRead: boolean;
  hadSensitiveInfo?: boolean;
  securityWarnings?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: function(this: IMessage) {
        // Text is required only if there's no image
        return !this.imageUrl;
      },
    },
    encryptedText: {
      type: String,
    },
    isEncrypted: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    hadSensitiveInfo: {
      type: Boolean,
      default: false,
    },
    securityWarnings: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching conversation messages
MessageSchema.index({ conversationId: 1, createdAt: 1 });

// Pre-save hook to encrypt and sanitize messages
MessageSchema.pre('save', function(next) {
  const message = this as IMessage;

  // Only process if text exists and this is a new message or text has been modified
  if (message.text && (message.isNew || message.isModified('text'))) {
    try {
      // First, sanitize the message for sensitive information
      const { sanitized, hadSensitiveInfo, warnings } = sanitizeMessage(message.text);

      // Update the text with sanitized version
      message.text = sanitized;
      message.hadSensitiveInfo = hadSensitiveInfo;
      message.securityWarnings = warnings;

      // Then encrypt the sanitized text
      if (message.isEncrypted) {
        message.encryptedText = encryptMessage(sanitized);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      return next(error as Error);
    }
  }

  next();
});

export default mongoose.model<IMessage>('Message', MessageSchema);
