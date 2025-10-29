import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Header from '../shared/Header';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import { EnvelopeIcon } from '../../constants';
import PropertyCard from './PropertyCard';

const InboxPage: React.FC = () => {
    const { state } = useAppContext();
    const { conversations, properties } = state;
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
        conversations.length > 0 ? conversations[0].id : null
    );

    const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;
    const featuredProperties = properties.slice(0, 3); // For the empty state

    return (
        <div className="h-screen w-screen flex flex-col bg-neutral-50">
            <Header />
            <main className="flex-grow flex flex-row overflow-hidden">
                {conversations.length > 0 ? (
                    <>
                        <div className="w-full md:w-1/3 lg:w-1/4 h-full flex-shrink-0 overflow-y-auto bg-white border-r border-neutral-200">
                            <ConversationList 
                                conversations={conversations}
                                selectedConversationId={selectedConversationId}
                                onSelectConversation={setSelectedConversationId}
                            />
                        </div>
                        <div className="flex-grow h-full">
                            {selectedConversation ? (
                                <ConversationView conversation={selectedConversation} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-center text-neutral-500">
                                    <p>Select a conversation to view messages.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="w-full flex flex-col items-center justify-center p-8 text-center">
                        <EnvelopeIcon className="w-16 h-16 text-neutral-300 mb-4" />
                        <h2 className="text-2xl font-bold text-neutral-800">Your Inbox is Empty</h2>
                        <p className="text-neutral-600 mt-2 max-w-md">
                            It looks like you haven't started any conversations yet. Inquire about a property to get started!
                        </p>
                        <div className="mt-8 w-full max-w-4xl">
                            <h3 className="text-lg font-semibold text-neutral-700 mb-4">Here are a few properties to get you started:</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredProperties.map(prop => (
                                    <PropertyCard key={prop.id} property={prop} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default InboxPage;
