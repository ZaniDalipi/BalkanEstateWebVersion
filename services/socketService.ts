import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: Map<string, Set<(message: Message) => void>> = new Map();
  private typingHandlers: Map<string, Set<(data: { userId: string; isTyping: boolean }) => void>> = new Map();
  private readHandlers: Map<string, Set<(data: { messageIds: string[]; readBy: string }) => void>> = new Map();
  private conversationHandlers: Set<(conversation: any) => void> = new Set();
  private deleteHandlers: Set<(conversationId: string) => void> = new Set();

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

    console.log('🔌 Connecting to WebSocket server:', serverUrl);

    this.socket = io(serverUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });

    // Handle incoming messages
    this.socket.on('message-received', (data: { conversationId: string; message: Message }) => {
      console.log('💬 Message received:', data);
      const handlers = this.messageHandlers.get(data.conversationId);
      if (handlers) {
        handlers.forEach(handler => handler(data.message));
      }
    });

    // Handle typing indicators
    this.socket.on('user-typing', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      const handlers = this.typingHandlers.get(data.conversationId);
      if (handlers) {
        handlers.forEach(handler => handler({ userId: data.userId, isTyping: data.isTyping }));
      }
    });

    // Handle read receipts
    this.socket.on('messages-read', (data: { conversationId: string; messageIds: string[]; readBy: string }) => {
      const handlers = this.readHandlers.get(data.conversationId);
      if (handlers) {
        handlers.forEach(handler => handler({ messageIds: data.messageIds, readBy: data.readBy }));
      }
    });

    // Handle new conversations
    this.socket.on('new-conversation', (conversation: any) => {
      console.log('📧 New conversation:', conversation);
      this.conversationHandlers.forEach(handler => handler(conversation));
    });

    // Handle conversation deletion
    this.socket.on('conversation-deleted', (conversationId: string) => {
      console.log('🗑️ Conversation deleted:', conversationId);
      this.deleteHandlers.forEach(handler => handler(conversationId));
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('👋 Disconnecting from WebSocket server');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a conversation room
  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      console.log('👥 Joining conversation:', conversationId);
      this.socket.emit('join-conversation', conversationId);
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      console.log('👋 Leaving conversation:', conversationId);
      this.socket.emit('leave-conversation', conversationId);
    }
  }

  // Send a new message event
  sendMessage(conversationId: string, message: Message) {
    if (this.socket?.connected) {
      this.socket.emit('new-message', { conversationId, message });
    }
  }

  // Send typing indicator
  sendTyping(conversationId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  // Mark messages as read
  markAsRead(conversationId: string, messageIds: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('mark-read', { conversationId, messageIds });
    }
  }

  // Subscribe to messages in a conversation
  onMessage(conversationId: string, handler: (message: Message) => void) {
    if (!this.messageHandlers.has(conversationId)) {
      this.messageHandlers.set(conversationId, new Set());
    }
    this.messageHandlers.get(conversationId)?.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(conversationId)?.delete(handler);
    };
  }

  // Subscribe to typing indicators
  onTyping(conversationId: string, handler: (data: { userId: string; isTyping: boolean }) => void) {
    if (!this.typingHandlers.has(conversationId)) {
      this.typingHandlers.set(conversationId, new Set());
    }
    this.typingHandlers.get(conversationId)?.add(handler);

    return () => {
      this.typingHandlers.get(conversationId)?.delete(handler);
    };
  }

  // Subscribe to read receipts
  onRead(conversationId: string, handler: (data: { messageIds: string[]; readBy: string }) => void) {
    if (!this.readHandlers.has(conversationId)) {
      this.readHandlers.set(conversationId, new Set());
    }
    this.readHandlers.get(conversationId)?.add(handler);

    return () => {
      this.readHandlers.get(conversationId)?.delete(handler);
    };
  }

  // Subscribe to new conversations
  onNewConversation(handler: (conversation: any) => void) {
    this.conversationHandlers.add(handler);

    return () => {
      this.conversationHandlers.delete(handler);
    };
  }

  // Subscribe to conversation deletions
  onConversationDeleted(handler: (conversationId: string) => void) {
    this.deleteHandlers.add(handler);

    return () => {
      this.deleteHandlers.delete(handler);
    };
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();
