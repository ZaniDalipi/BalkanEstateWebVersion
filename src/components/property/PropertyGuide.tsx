// PropertyGuide Component
// A friendly mascot guide inspired by Duolingo that helps users navigate the property details

import React, { useState, useEffect } from 'react';
import { Property } from '../../../types';

interface PropertyGuideProps {
  property: Property;
  onDismiss?: () => void;
}

interface GuideMessage {
  text: string;
  emoji?: string;
}

/**
 * PropertyGuide Component
 *
 * A cute animated house mascot that provides contextual tips and guidance
 * similar to Duolingo's owl. Features:
 * - Bouncing/waving animation
 * - Contextual property tips
 * - Speech bubble with messages
 * - Dismissible with memory
 *
 * Usage:
 * ```tsx
 * <PropertyGuide property={property} onDismiss={() => setShowGuide(false)} />
 * ```
 */
export const PropertyGuide: React.FC<PropertyGuideProps> = ({ property, onDismiss }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isWaving, setIsWaving] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [showBubble, setShowBubble] = useState(true);

  // Generate contextual messages based on property
  const getMessages = (): GuideMessage[] => {
    const messages: GuideMessage[] = [
      { text: "Welcome! I'm here to help you explore this property.", emoji: "👋" },
    ];

    // Price insight
    if (property.price) {
      messages.push({
        text: "Check out the mortgage calculator on the right to see monthly payments!",
        emoji: "💰"
      });
    }

    // Tour available
    if (property.tourUrl) {
      messages.push({
        text: "This property has a 3D virtual tour! Click the button in the gallery to explore.",
        emoji: "🎥"
      });
    }

    // Good condition
    if (property.condition === 'new' || property.condition === 'excellent') {
      messages.push({
        text: `This property is in ${property.condition} condition - great find!`,
        emoji: "✨"
      });
    }

    // Has pool
    if (property.hasPool) {
      messages.push({
        text: "Did you notice? This property has a swimming pool!",
        emoji: "🏊"
      });
    }

    // Near beach
    if (property.distanceToSea && property.distanceToSea < 5) {
      messages.push({
        text: `Only ${property.distanceToSea.toFixed(1)}km to the beach! Perfect for summer days.`,
        emoji: "🏖️"
      });
    }

    // Multiple images
    if (property.images && property.images.length > 5) {
      messages.push({
        text: "Lots of photos to browse! Click on the gallery to view them all.",
        emoji: "📸"
      });
    }

    // Floor plan available
    if (property.floorplanUrl) {
      messages.push({
        text: "There's an interactive floor plan! Check it out in Property Details.",
        emoji: "📐"
      });
    }

    // General tips
    messages.push({
      text: "Don't forget to save this property if you like it! Click the heart icon.",
      emoji: "❤️"
    });

    messages.push({
      text: "Have questions? Message the seller directly using the contact form!",
      emoji: "💬"
    });

    return messages;
  };

  const messages = getMessages();

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500); // Appear after 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  // Wave animation cycle
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 1000);
    }, 5000);

    return () => clearInterval(waveInterval);
  }, []);

  // Cycle through messages
  useEffect(() => {
    if (!showBubble) return;

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 8000);

    return () => clearInterval(messageInterval);
  }, [messages.length, showBubble]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  const toggleBubble = () => {
    setShowBubble(!showBubble);
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 1000);
  };

  if (!isVisible) {
    return null;
  }

  const currentMessage = messages[currentMessageIndex];

  return (
    <div
      className={`fixed bottom-6 left-6 z-40 transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      {/* Speech Bubble */}
      {showBubble && (
        <div className="absolute bottom-full left-12 mb-2 animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-xl border border-neutral-200 p-4 max-w-[280px] sm:max-w-xs">
            {/* Close bubble button */}
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors shadow-md"
              aria-label="Close guide"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Message content */}
            <div className="flex items-start gap-2">
              {currentMessage.emoji && (
                <span className="text-2xl flex-shrink-0">{currentMessage.emoji}</span>
              )}
              <p className="text-sm text-neutral-700 leading-relaxed">
                {currentMessage.text}
              </p>
            </div>

            {/* Message dots indicator */}
            <div className="flex justify-center gap-1 mt-3">
              {messages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMessageIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentMessageIndex
                      ? 'bg-primary w-4'
                      : 'bg-neutral-300 hover:bg-neutral-400'
                  }`}
                  aria-label={`Go to message ${index + 1}`}
                />
              ))}
            </div>

            {/* Speech bubble pointer */}
            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-r border-b border-neutral-200 transform rotate-45"></div>
          </div>
        </div>
      )}

      {/* Mascot Character - Cute House */}
      <button
        onClick={toggleBubble}
        className={`relative group cursor-pointer transition-transform duration-300 hover:scale-110 ${
          isWaving ? 'animate-bounce' : ''
        }`}
        aria-label="Property guide mascot"
      >
        {/* Character body - House shape */}
        <div className="relative">
          {/* House main body */}
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            {/* House base */}
            <rect x="12" y="28" width="40" height="32" rx="4" fill="#3B82F6" />

            {/* Roof */}
            <path d="M6 32L32 8L58 32" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="#3B82F6"/>
            <path d="M10 30L32 10L54 30" fill="#2563EB"/>

            {/* Door */}
            <rect x="26" y="40" width="12" height="20" rx="2" fill="#FCD34D"/>
            <circle cx="35" cy="50" r="1.5" fill="#B45309"/>

            {/* Windows - Eyes */}
            <g className="animate-pulse">
              <rect x="16" y="34" width="8" height="8" rx="2" fill="white"/>
              <rect x="40" y="34" width="8" height="8" rx="2" fill="white"/>
              {/* Pupils */}
              <circle cx="21" cy="38" r="2" fill="#1E3A8A">
                <animate attributeName="cx" values="21;22;21;20;21" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="45" cy="38" r="2" fill="#1E3A8A">
                <animate attributeName="cx" values="45;46;45;44;45" dur="3s" repeatCount="indefinite"/>
              </circle>
            </g>

            {/* Smile */}
            <path d="M26 48C26 48 29 52 32 52C35 52 38 48 38 48" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" fill="none"/>

            {/* Chimney */}
            <rect x="44" y="12" width="8" height="14" rx="1" fill="#EF4444"/>

            {/* Chimney smoke - animated */}
            <g className="animate-float">
              <circle cx="48" cy="6" r="3" fill="#E5E7EB" opacity="0.8">
                <animate attributeName="cy" values="6;2;6" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="52" cy="4" r="2" fill="#E5E7EB" opacity="0.6">
                <animate attributeName="cy" values="4;0;4" dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite"/>
              </circle>
            </g>

            {/* Waving hand/flag */}
            {isWaving && (
              <g className="origin-bottom-left">
                <rect x="52" y="20" width="3" height="12" fill="#8B5CF6" rx="1">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 52 32;-15 52 32;15 52 32;0 52 32"
                    dur="0.5s"
                    repeatCount="2"
                  />
                </rect>
                <rect x="48" y="16" width="10" height="6" fill="#8B5CF6" rx="1">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 52 32;-15 52 32;15 52 32;0 52 32"
                    dur="0.5s"
                    repeatCount="2"
                  />
                </rect>
              </g>
            )}
          </svg>

          {/* Notification badge when bubble is hidden */}
          {!showBubble && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs font-bold">{messages.length}</span>
            </div>
          )}
        </div>

        {/* Hover tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {showBubble ? 'Click to minimize' : 'Click to see tips'}
          </div>
        </div>
      </button>

      {/* Inline styles for custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PropertyGuide;
