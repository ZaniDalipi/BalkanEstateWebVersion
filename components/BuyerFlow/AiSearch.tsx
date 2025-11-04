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
    const [history, setHistory] = useState<ChatMessage[]>([
        { sender: 'ai', text: "Hello! Welcome to Balkan Estate. How can I help you find a property today?" }
    ]);
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
        <div className={`flex flex-col h-full bg-white`}>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {history.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                         {msg.sender === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <SparklesIcon className="w-5 h-5 text-white"/>
                            </div>
                         )}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-neutral-100 text-neutral-800 rounded-bl-none'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}

                {isSearching && (
                    <div className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white"/></div>
                        <div className="p-3 rounded-2xl bg-white border shadow-sm">
                           <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse"></div>
                           </div>
                        </div>
                    </div>
                )}

                {finalQuery && (
                    <div className="flex justify-center py-4">
                        <button onClick={handleApplyClick} className="px-6 py-2 bg-secondary text-white font-bold rounded-full shadow-md hover:bg-opacity-90 transition-transform hover:scale-105">
                            Apply Search
                        </button>
                    </div>
                )}
                <div ref={chatEndRef}></div>
            </div>
            
            <div className="flex-shrink-0 p-4 bg-white border-t">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Tell me what you're looking for..."
                        className="w-full px-5 py-3 pr-14 text-base bg-neutral-100 border-neutral-200 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isSearching}
                    />
                    <button type="submit" disabled={isSearching || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white rounded-full p-2.5 hover:bg-primary-dark disabled:bg-neutral-300 transition-colors">
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AiSearch;