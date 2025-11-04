import React, { useState } from 'react';
import { Conversation } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { BuildingOfficeIcon } from '../../constants';

interface ConversationListItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onSelect: () => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({ conversation, isSelected, onSelect }) => {
    const { state, dispatch } = useAppContext();
    const [imageError, setImageError] = useState(false);
    const property = state.properties.find(p => p.id === conversation.propertyId);

    if (!property) {
        return null; // Or some fallback UI
    }
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const unreadCount = conversation.messages.filter(m => !m.isRead && m.senderId !== 'user').length;
    
    const handleClick = () => {
        onSelect();
        if (unreadCount > 0) {
            dispatch({ type: 'MARK_CONVERSATION_AS_READ', payload: conversation.id });
        }
    };

    return (
        <button 
            onClick={handleClick}
            className={`w-full text-left p-3 flex items-start gap-3 transition-colors duration-200 border-b border-neutral-100 ${
                isSelected ? 'bg-primary-light' : 'hover:bg-neutral-50'
            }`}
        >
            {imageError ? (
                <div className="w-16 h-16 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center rounded-md flex-shrink-0">
                    <BuildingOfficeIcon className="w-8 h-8 text-neutral-400" />
                </div>
            ) : (
                <img 
                    src={property.imageUrl} 
                    alt={property.address}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    onError={() => setImageError(true)}
                />
            )}
            <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className={`font-bold text-sm truncate ${isSelected ? 'text-primary-dark' : 'text-neutral-800'}`}>{property.address}</p>
                    {unreadCount > 0 && (
                         <span className="bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ml-2">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <p className="text-xs text-neutral-500 truncate">{property.city}, {property.country}</p>
                <p className="text-xs text-neutral-600 mt-1 truncate">
                    {lastMessage.senderId === 'user' && 'You: '}{lastMessage.text}
                </p>
            </div>
        </button>
    );
};

export default ConversationListItem;