import React, { useRef, useEffect } from 'react';
import { Conversation, Message } from '../../types';
import { useAppContext } from '../../context/AppContext';
import MessageInput from './MessageInput';
import { formatPrice } from '../../utils/currency';
import { CalendarIcon, UserCircleIcon } from '../../constants';

interface ConversationViewProps {
    conversation: Conversation;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversation }) => {
    const { state, dispatch } = useAppContext();
    const property = state.properties.find(p => p.id === conversation.propertyId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    useEffect(scrollToBottom, [conversation.messages]);
    
    if (!property) return <div>Loading property...</div>;

    const handleSendMessage = (text: string) => {
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: 'user',
            text,
            timestamp: new Date().toISOString(),
            isRead: true, // User's own message is always "read"
        };
        dispatch({ type: 'ADD_MESSAGE', payload: { conversationId: conversation.id, message: newMessage }});
    };
    
    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-3 border-b border-neutral-200 flex-shrink-0 flex items-center gap-4">
                <img src={property.imageUrl} alt={property.address} className="w-12 h-12 object-cover rounded-lg" />
                <div className="flex-grow">
                    <p className="font-bold text-neutral-800">{property.address}, {property.city}</p>
                    <p className="text-sm font-semibold text-primary">{formatPrice(property.price, property.country)}</p>
                </div>
                <button 
                    onClick={() => dispatch({ type: 'SET_SELECTED_PROPERTY', payload: property })}
                    className="px-4 py-2 text-sm font-semibold bg-primary-light text-primary-dark rounded-full hover:bg-primary/20 transition-colors"
                >
                    View Property
                </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {conversation.messages.map(msg => {
                    const isUser = msg.senderId === 'user';
                    const seller = property.seller;

                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                            {!isUser && (
                                <div className="flex-shrink-0">
                                    {seller.avatarUrl ? (
                                        <img src={seller.avatarUrl} alt={seller.name} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <UserCircleIcon className="w-8 h-8 text-neutral-400" />
                                    )}
                                </div>
                            )}
                            <div className={`max-w-md px-4 py-2 rounded-2xl ${isUser 
                                ? 'bg-primary text-white rounded-br-lg' 
                                : 'bg-neutral-100 text-neutral-800 rounded-bl-lg'
                            }`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            
             {/* Quick Actions */}
            <div className="p-2 border-t border-neutral-200 flex-shrink-0">
                 <div className="flex items-center justify-center gap-2">
                     <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary-dark bg-primary-light rounded-full hover:bg-primary/20 transition-colors">
                        <CalendarIcon className="w-4 h-4"/> Schedule a Tour
                    </button>
                     <button className="px-3 py-1.5 text-xs font-semibold text-primary-dark bg-primary-light rounded-full hover:bg-primary/20 transition-colors">Request More Info</button>
                     <button className="px-3 py-1.5 text-xs font-semibold text-primary-dark bg-primary-light rounded-full hover:bg-primary/20 transition-colors">Make an Offer</button>
                </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-neutral-200 flex-shrink-0 bg-neutral-50">
                <MessageInput onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
};

export default ConversationView;
