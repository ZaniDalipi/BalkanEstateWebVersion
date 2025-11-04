import React, { useRef, useEffect, useState } from 'react';
import { Conversation, Message } from '../../types';
import { useAppContext } from '../../context/AppContext';
import MessageInput from './MessageInput';
import { formatPrice } from '../../utils/currency';
import { CalendarIcon, UserCircleIcon, ChevronLeftIcon, BuildingOfficeIcon } from '../../constants';

interface ConversationViewProps {
    conversation: Conversation;
    onBack?: () => void; // Optional callback for mobile back button
}

const MessageImage: React.FC<{imageUrl: string}> = ({imageUrl}) => {
    const [error, setError] = useState(false);
    useEffect(() => { setError(false); }, [imageUrl]);

    if(error) {
        return <div className="p-4 bg-neutral-200 rounded-lg text-neutral-500 text-xs">Image failed to load.</div>
    }

    return <img src={imageUrl} alt="Annotated property" className="max-w-full h-auto rounded-lg" onError={() => setError(true)} />
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversation, onBack }) => {
    const { state, dispatch } = useAppContext();
    const [imageError, setImageError] = useState(false);
    const property = state.properties.find(p => p.id === conversation.propertyId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    useEffect(scrollToBottom, [conversation.messages]);
    
    if (!property) { 
        return (
            <div className="h-full flex items-center justify-center text-center text-neutral-500 p-4">
                <p>Property data not found. It may have been removed.</p>
            </div>
        );
    }

    const handleSendMessage = (text: string) => {
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: 'user',
            text,
            timestamp: new Date().toISOString(),
            isRead: true, 
        };
        dispatch({ type: 'ADD_MESSAGE', payload: { conversationId: conversation.id, message: newMessage }});
    };
    
    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-3 border-b border-neutral-200 flex-shrink-0 flex items-center gap-3">
                {onBack && (
                    <button onClick={onBack} className="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-full">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                )}
                {imageError ? (
                    <div className="w-12 h-12 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center rounded-lg flex-shrink-0">
                        <BuildingOfficeIcon className="w-6 h-6 text-neutral-400" />
                    </div>
                ) : (
                    <img src={property.imageUrl} alt={property.address} className="w-12 h-12 object-cover rounded-lg" onError={() => setImageError(true)} />
                )}
                <div className="flex-grow">
                    <p className="font-bold text-neutral-800 truncate">{property.address}, {property.city}</p>
                    <p className="text-sm font-semibold text-primary">{formatPrice(property.price, property.country)}</p>
                </div>
                <button 
                    onClick={() => dispatch({ type: 'SET_SELECTED_PROPERTY', payload: property.id })}
                    className="hidden sm:block px-4 py-2 text-sm font-semibold bg-primary-light text-primary-dark rounded-full hover:bg-primary/20 transition-colors"
                >
                    View Property
                </button>
            </div>

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
                            <div className={`max-w-md p-3 rounded-2xl ${isUser 
                                ? 'bg-primary text-white rounded-br-lg' 
                                : 'bg-neutral-100 text-neutral-800 rounded-bl-lg'
                            }`}>
                                {msg.text && <p className="text-sm">{msg.text}</p>}
                                {msg.imageUrl && <MessageImage imageUrl={msg.imageUrl} />}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            
             <div className="p-2 border-t border-neutral-200 flex-shrink-0">
                 <div className="flex items-center justify-center gap-2 flex-wrap">
                     <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary-dark bg-primary-light rounded-full hover:bg-primary/20 transition-colors">
                        <CalendarIcon className="w-4 h-4"/> Schedule a Tour
                    </button>
                     <button className="px-3 py-1.5 text-xs font-semibold text-primary-dark bg-primary-light rounded-full hover:bg-primary/20 transition-colors">Request More Info</button>
                     <button className="px-3 py-1.5 text-xs font-semibold text-primary-dark bg-primary-light rounded-full hover:bg-primary/20 transition-colors">Make an Offer</button>
                </div>
            </div>

            <div className="p-4 border-t border-neutral-200 flex-shrink-0 bg-neutral-50">
                <MessageInput onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
};

export default ConversationView;