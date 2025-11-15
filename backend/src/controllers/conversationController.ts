import { Request, Response } from 'express';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Property from '../models/Property';
import { IUser } from '../models/User';
import { decryptMessage } from '../utils/encryption';
import { SECURITY_WARNING } from '../utils/messageFilter';
import cloudinary from '../config/cloudinary';

// @desc    Get user's conversations
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Find conversations where user is either buyer or seller
    const conversations = await Conversation.find({
      $or: [{ buyerId: String((req.user as IUser)._id) }, { sellerId: String((req.user as IUser)._id) }],
    })
      .populate('propertyId')
      .populate('buyerId', 'name email phone avatarUrl')
      .populate('sellerId', 'name email phone avatarUrl role agencyName')
      .sort({ lastMessageAt: -1 });

    // Get last message for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({
          conversationId: conv._id,
        }).sort({ createdAt: -1 });

        return {
          ...conv.toObject(),
          lastMessage,
        };
      })
    );

    res.json({ conversations: conversationsWithMessages });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};

// @desc    Get single conversation with messages
// @route   GET /api/conversations/:id
// @access  Private
export const getConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const conversation = await Conversation.findById(req.params.id)
      .populate('propertyId')
      .populate('buyerId', 'name email phone avatarUrl')
      .populate('sellerId', 'name email phone avatarUrl role agencyName');

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    // Check if user is part of conversation
    const isBuyer = conversation.buyerId._id.toString() === String((req.user as IUser)._id).toString();
    const isSeller = conversation.sellerId._id.toString() === String((req.user as IUser)._id).toString();

    if (!isBuyer && !isSeller) {
      res.status(403).json({ message: 'Not authorized to view this conversation' });
      return;
    }

    // Get messages and decrypt them
    const rawMessages = await Message.find({ conversationId: conversation._id })
      .populate('senderId', 'name avatarUrl')
      .sort({ createdAt: 1 });

    // Decrypt messages for display
    const messages = rawMessages.map(msg => {
      const messageObj = msg.toObject();
      if (messageObj.isEncrypted && messageObj.encryptedText) {
        try {
          messageObj.text = decryptMessage(messageObj.encryptedText);
        } catch (error) {
          console.error('Failed to decrypt message:', error);
          messageObj.text = '[Message could not be decrypted]';
        }
      }
      // Remove encrypted text from response
      delete messageObj.encryptedText;
      return messageObj;
    });

    // Mark messages as read
    if (isBuyer) {
      await Message.updateMany(
        {
          conversationId: conversation._id,
          senderId: conversation.sellerId._id,
          isRead: false,
        },
        { isRead: true }
      );
      conversation.buyerUnreadCount = 0;
    } else {
      await Message.updateMany(
        {
          conversationId: conversation._id,
          senderId: conversation.buyerId._id,
          isRead: false,
        },
        { isRead: true }
      );
      conversation.sellerUnreadCount = 0;
    }

    await conversation.save();

    res.json({ conversation, messages });
  } catch (error: any) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
};

// @desc    Create or get conversation
// @route   POST /api/conversations
// @access  Private
export const createConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { propertyId } = req.body;

    if (!propertyId) {
      res.status(400).json({ message: 'Property ID is required' });
      return;
    }

    // Get property
    const property = await Property.findById(propertyId);

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    // Can't create conversation with yourself
    if (property.sellerId.toString() === String((req.user as IUser)._id).toString()) {
      res.status(400).json({ message: 'Cannot create conversation with yourself' });
      return;
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      propertyId,
      buyerId: String((req.user as IUser)._id),
      sellerId: property.sellerId,
    })
      .populate('propertyId')
      .populate('buyerId', 'name email phone avatarUrl')
      .populate('sellerId', 'name email phone avatarUrl role agencyName');

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        propertyId,
        buyerId: String((req.user as IUser)._id),
        sellerId: property.sellerId,
      });

      // Increment inquiries count
      property.inquiries += 1;
      await property.save();

      await conversation.populate('propertyId');
      await conversation.populate('buyerId', 'name email phone avatarUrl');
      await conversation.populate(
        'sellerId',
        'name email phone avatarUrl role agencyName'
      );
    }

    res.status(201).json({ conversation });
  } catch (error: any) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Error creating conversation', error: error.message });
  }
};

// @desc    Send message
// @route   POST /api/conversations/:id/messages
// @access  Private
export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { text, imageUrl } = req.body;

    if (!text && !imageUrl) {
      res.status(400).json({ message: 'Message text or image is required' });
      return;
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    // Check if user is part of conversation
    const isBuyer = conversation.buyerId.toString() === String((req.user as IUser)._id).toString();
    const isSeller = conversation.sellerId.toString() === String((req.user as IUser)._id).toString();

    if (!isBuyer && !isSeller) {
      res.status(403).json({ message: 'Not authorized to send message' });
      return;
    }

    // Create message (encryption and sanitization happens in pre-save hook)
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: String((req.user as IUser)._id),
      text: text || '',
      imageUrl,
    });

    // Update conversation
    conversation.lastMessageAt = new Date();
    if (isBuyer) {
      conversation.sellerUnreadCount += 1;
    } else {
      conversation.buyerUnreadCount += 1;
    }
    await conversation.save();

    await message.populate('senderId', 'name avatarUrl');

    // Decrypt message for response
    const messageObj = message.toObject();
    if (messageObj.isEncrypted && messageObj.encryptedText) {
      try {
        messageObj.text = decryptMessage(messageObj.encryptedText);
      } catch (error) {
        console.error('Failed to decrypt message:', error);
      }
    }
    // Remove encrypted text from response
    delete messageObj.encryptedText;

    // Include security warnings if any
    const response: any = { message: messageObj };
    if (message.hadSensitiveInfo && message.securityWarnings.length > 0) {
      response.securityWarnings = message.securityWarnings;
    }

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// @desc    Upload image for message
// @route   POST /api/conversations/:id/upload-image
// @access  Private
export const uploadMessageImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No image file provided' });
      return;
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    // Check if user is part of conversation
    const isBuyer = conversation.buyerId.toString() === String((req.user as IUser)._id).toString();
    const isSeller = conversation.sellerId.toString() === String((req.user as IUser)._id).toString();

    if (!isBuyer && !isSeller) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Upload to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'balkan-estate/messages',
      resource_type: 'image',
    });

    res.json({ imageUrl: result.secure_url });
  } catch (error: any) {
    console.error('Upload message image error:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};

// @desc    Get security warning
// @route   GET /api/conversations/security-warning
// @access  Public
export const getSecurityWarning = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.json({ warning: SECURITY_WARNING });
};

// @desc    Mark conversation as read
// @route   PATCH /api/conversations/:id/read
// @access  Private
export const markAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    // Check if user is part of conversation
    const isBuyer = conversation.buyerId.toString() === String((req.user as IUser)._id).toString();
    const isSeller = conversation.sellerId.toString() === String((req.user as IUser)._id).toString();

    if (!isBuyer && !isSeller) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Mark messages as read
    if (isBuyer) {
      await Message.updateMany(
        {
          conversationId: conversation._id,
          senderId: conversation.sellerId,
          isRead: false,
        },
        { isRead: true }
      );
      conversation.buyerUnreadCount = 0;
    } else {
      await Message.updateMany(
        {
          conversationId: conversation._id,
          senderId: conversation.buyerId,
          isRead: false,
        },
        { isRead: true }
      );
      conversation.sellerUnreadCount = 0;
    }

    await conversation.save();

    res.json({ message: 'Marked as read' });
  } catch (error: any) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Error marking as read', error: error.message });
  }
};
