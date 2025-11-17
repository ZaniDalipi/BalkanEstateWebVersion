import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import { EnvelopeIcon } from '../../constants';
import PropertyCard from './PropertyCard';

const InboxPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { conversations, properties, isAuthenticated, activeConversationId } = state;

    // A check to determine if we are on a mobile device based on window width.
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    // Use activeConversationId from global state if available (highest priority)
    useEffect(() => {
        if (activeConversationId) {
            console.log('Active conversation ID detected:', activeConversationId);
            console.log('Conversations:', conversations.map(c => c.id));
            const conversation = conversations.find(c => c.id === activeConversationId);
            if (conversation) {
                console.log('Found conversation, selecting it');
                setSelectedConversationId(activeConversationId);
                // Clear the active conversation from global state after using it
                setTimeout(() => {
                    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: null });
                }, 100);
            } else {
                console.log('Conversation not found in list yet, waiting...');
            }
        }
    }, [activeConversationId, conversations, dispatch]);

    // Auto-select first conversation on desktop when no conversation is selected
    useEffect(() => {
        if (!isMobile && !selectedConversationId && conversations.length > 0 && !activeConversationId) {
            setSelectedConversationId(conversations[0].id);
        }
    }, [isMobile, selectedConversationId, conversations, activeConversationId]);


    const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;
    const featuredProperties = properties.slice(0, 3); // For the empty state

    if (!isAuthenticated) {
        return (
            <div className="w-full flex flex-col items-center justify-center p-4 sm:p-8 text-center h-full">
                <EnvelopeIcon className="w-16 h-16 text-neutral-300 mb-4" />
                <h2 className="text-2xl font-bold text-neutral-800">Log in to view your messages</h2>
                <p className="text-neutral-600 mt-2 max-w-md">
                    Communicate with sellers and agents about your favorite properties.
                </p>
                <button
                    // FIX: The payload for TOGGLE_AUTH_MODAL must be an object.
                    onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } })}
                    className="mt-8 px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                >
                    Login / Register
                </button>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="w-full flex flex-col items-center justify-center p-4 sm:p-8 text-center">
                <EnvelopeIcon className="w-16 h-16 text-neutral-300 mb-4" />
                <h2 className="text-2xl font-bold text-neutral-800">Your Inbox is Empty</h2>
                <p className="text-neutral-600 mt-2 max-w-md">
                    Inquire about a property to get started!
                </p>
                <div className="mt-8 w-full max-w-4xl">
                    <h3 className="text-lg font-semibold text-neutral-700 mb-4">Here are a few properties:</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProperties.map(prop => (
                            <PropertyCard key={prop.id} property={prop} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col bg-neutral-50">
            <main className="flex-grow flex flex-row overflow-hidden">
                <div className={`
                    ${isMobile && selectedConversationId ? 'hidden' : 'block'}
                    w-full md:w-1/3 lg:w-1/4 h-full flex-shrink-0 overflow-y-auto bg-white border-r border-neutral-200
                `}>
                    <ConversationList 
                        conversations={conversations}
                        selectedConversationId={selectedConversationId}
                        onSelectConversation={setSelectedConversationId}
                    />
                </div>
                <div className={`
                    ${isMobile && !selectedConversationId ? 'hidden' : 'block'}
                    flex-grow h-full
                `}>
                    {selectedConversation ? (
                        <ConversationView 
                            conversation={selectedConversation}
                            onBack={() => isMobile && setSelectedConversationId(null)}
                        />
                    ) : (
                        <div className="h-full hidden md:flex items-center justify-center text-center text-neutral-500">
                            <p>Select a conversation to view messages.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InboxPage;