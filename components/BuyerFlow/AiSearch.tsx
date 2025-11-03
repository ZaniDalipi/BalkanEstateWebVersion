import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, AiSearchQuery, Property } from '../../types';
import { getAiChatResponse } from '../../services/geminiService';
import { PaperAirplaneIcon, SparklesIcon } from '../../constants';

interface AiSearchProps {
    properties: Property[];
    onApplyFilters: (query: AiSearchQuery) => void;
    isMobile: boolean;
}

const AiSearch: React.FC<AiSearchProps> = ({ properties, onApplyFilters, isMobile }) => {
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [finalQuery, setFinalQuery] = useState<AiSearchQuery | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [history, isSearching]);

    const handleSendMessage = useCallback(async () => {
        if (!input.trim()) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        const newHistory = [...history, userMessage];
        setHistory(newHistory);
        setInput('');
        setIsSearching(true);
        setFinalQuery(null);

        try {
            const result = await getAiChatResponse(newHistory, properties);
            const aiMessage: ChatMessage = { sender: 'ai', text: result.responseMessage };
            setHistory(prev => [...prev, aiMessage]);
            if (result.isFinalQuery && result.searchQuery) {
                setFinalQuery(result.searchQuery);
            }
        } catch (error) {
            console.error("AI chat error:", error);
            const errorMessage: ChatMessage = { sender: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again in a moment." };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsSearching(false);
        }
    }, [input, history, properties]);

    const handleApplyClick = () => {
        if (finalQuery) {
            onApplyFilters(finalQuery);
        }
    };

    return (
        <div className={`flex flex-col ${isMobile ? 'h-full' : ''}`}>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {history.length === 0 && (
                    <div className="text-center p-8 text-neutral-500">
                        <SparklesIcon className="w-12 h-12 mx-auto text-primary/50 mb-4" />
                        <p className="font-semibold">Chat with our AI Assistant</p>
                        <p className="text-sm mt-1">Describe what you're looking for, e.g., "A modern apartment in Belgrade with 2 bedrooms for under €200,000."</p>
                    </div>
                )}
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-lg' : 'bg-neutral-100 text-neutral-800 rounded-bl-lg'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isSearching && (
                    <div className="flex justify-start">
                        <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-neutral-100 text-neutral-800">
                           <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse"></div>
                           </div>
                        </div>
                    </div>
                )}
                {finalQuery && (
                    <div className="flex justify-center mt-4">
                        <button onClick={handleApplyClick} className="px-6 py-2 bg-secondary text-white font-bold rounded-full shadow-md hover:bg-opacity-90">
                            Apply Filters
                        </button>
                    </div>
                )}
                <div ref={chatEndRef}></div>
            </div>
            <div className="flex-shrink-0 p-4 border-t border-neutral-200 bg-white">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Tell me what you're looking for..."
                        className="flex-grow px-4 py-2.5 border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isSearching}
                    />
                    <button type="submit" disabled={isSearching || !input.trim()} className="bg-primary text-white rounded-full p-3 hover:bg-primary-dark disabled:bg-neutral-300">
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AiSearch;