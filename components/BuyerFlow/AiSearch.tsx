import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, AiSearchQuery, Property } from '../../types';
import { getAiChatResponse } from '../../services/geminiService';
import { PaperAirplaneIcon, SparklesIcon } from '../../constants';
import UpgradePrompt from '../shared/UpgradePrompt';

interface AiSearchProps {
    properties: Property[];
    onApplyFilters: (query: AiSearchQuery) => void;
    isMobile: boolean;
    history: ChatMessage[];
    onHistoryChange: (history: ChatMessage[]) => void;
}

const FilterPill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-primary-light text-primary-dark text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center justify-center text-center">
        {children}
    </div>
);

const AiSearch: React.FC<AiSearchProps> = ({ properties, onApplyFilters, isMobile, history, onHistoryChange }) => {
    const [input, setInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [finalQuery, setFinalQuery] = useState<AiSearchQuery | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const [upgradePromptData, setUpgradePromptData] = useState<any>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [history, isSearching]);

    const handleSendMessage = useCallback(async () => {
        if (!input.trim()) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        const newHistory = [...history, userMessage];
        onHistoryChange(newHistory);
        setInput('');
        setIsSearching(true);
        setFinalQuery(null);

        try {
            const result = await getAiChatResponse(newHistory, properties);
            const aiMessage: ChatMessage = { sender: 'ai', text: result.responseMessage };
            onHistoryChange([...newHistory, aiMessage]);
            if (result.isFinalQuery && result.searchQuery) {
                setFinalQuery(result.searchQuery);
            }
        } catch (error: any) {
            console.error("AI chat error:", error);

            // Check if it's a limit error
            if (error.code === 'FEATURE_LIMIT_REACHED') {
                setUpgradePromptData({
                    title: 'AI Search Limit Reached',
                    message: error.message || `You've reached your daily limit of AI searches.`,
                    current: error.current,
                    limit: error.limit,
                    featureType: 'AI searches',
                    recommendedProducts: error.recommendedProducts || [],
                    upgradeMessage: error.upgradeMessage,
                });
                setShowUpgradePrompt(true);

                const errorMessage: ChatMessage = {
                    sender: 'ai',
                    text: `${error.message || "You've reached your daily AI search limit."} Upgrade to get unlimited AI searches!`
                };
                onHistoryChange([...newHistory, errorMessage]);
            } else {
                const errorMessage: ChatMessage = { sender: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again in a moment." };
                onHistoryChange([...newHistory, errorMessage]);
            }
        } finally {
            setIsSearching(false);
        }
    }, [input, history, properties, onHistoryChange]);

    const handleApplyClick = () => {
        if (finalQuery) {
            onApplyFilters(finalQuery);
        }
    };

    const renderFilters = (query: AiSearchQuery) => {
        const formatCurrency = (val: number) => `€${new Intl.NumberFormat('de-DE').format(val)}`;
        const pills = [];

        if (query.location) pills.push(<FilterPill key="loc">📍 {query.location}</FilterPill>);
        if (query.minPrice && query.maxPrice) pills.push(<FilterPill key="price">{formatCurrency(query.minPrice)} - {formatCurrency(query.maxPrice)}</FilterPill>);
        else if (query.minPrice) pills.push(<FilterPill key="price">≥ {formatCurrency(query.minPrice)}</FilterPill>);
        else if (query.maxPrice) pills.push(<FilterPill key="price">≤ {formatCurrency(query.maxPrice)}</FilterPill>);
        
        if (query.beds) pills.push(<FilterPill key="beds">🛏️ {query.beds}+ beds</FilterPill>);
        if (query.baths) pills.push(<FilterPill key="baths">🛁 {query.baths}+ baths</FilterPill>);
        if (query.livingRooms) pills.push(<FilterPill key="lr">🛋️ {query.livingRooms}+ living</FilterPill>);

        if (query.minSqft && query.maxSqft) pills.push(<FilterPill key="sqft">{query.minSqft}-{query.maxSqft} m²</FilterPill>);
        else if (query.minSqft) pills.push(<FilterPill key="sqft">≥ {query.minSqft} m²</FilterPill>);
        else if (query.maxSqft) pills.push(<FilterPill key="sqft">≤ {query.maxSqft} m²</FilterPill>);

        if (query.features && query.features.length > 0) {
            query.features.forEach(f => pills.push(<FilterPill key={f}>✨ {f}</FilterPill>));
        }

        return pills;
    };

    return (
        <>
        <div className={`flex flex-col h-full bg-white border border-neutral-200 rounded-lg`}>
            <div className="flex-grow min-h-0 p-4 space-y-4 overflow-y-auto">
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
                <div ref={chatEndRef}></div>
            </div>
            
            <form 
                onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (!finalQuery) handleSendMessage();
                }} 
                className="flex-shrink-0 p-4 bg-white border-t space-y-3"
            >
                 {finalQuery && (
                    <div className="animate-fade-in py-3 border-y border-neutral-200">
                        <div className="flex flex-wrap items-center gap-2">
                            {renderFilters(finalQuery)}
                        </div>
                    </div>
                )}
                <div className="flex items-end gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Tell me what you're looking for..."
                        className="flex-grow px-5 py-3 text-base text-neutral-900 bg-neutral-100 border-neutral-200 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isSearching}
                    />
                    {finalQuery ? (
                         <button type="button" onClick={handleApplyClick} className="px-6 py-3 bg-primary text-white font-bold rounded-full shadow-md hover:bg-primary-dark transition-colors whitespace-nowrap">
                            Proceed
                        </button>
                    ) : (
                        <button type="submit" disabled={isSearching || !input.trim()} className="bg-primary text-white rounded-full p-3.5 hover:bg-primary-dark disabled:bg-neutral-300 transition-colors flex-shrink-0">
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </form>
        </div>

        {/* Upgrade Prompt Modal */}
        {showUpgradePrompt && upgradePromptData && (
            <UpgradePrompt
                isOpen={showUpgradePrompt}
                onClose={() => setShowUpgradePrompt(false)}
                title={upgradePromptData.title}
                message={upgradePromptData.message}
                featureType={upgradePromptData.featureType}
                current={upgradePromptData.current}
                limit={upgradePromptData.limit}
                recommendedProducts={upgradePromptData.recommendedProducts}
                onSelectPlan={(productId) => {
                    console.log('Selected plan:', productId);
                    // TODO: Implement navigation to subscription/payment page
                    setShowUpgradePrompt(false);
                }}
            />
        )}
        </>
    );
};

export default AiSearch;