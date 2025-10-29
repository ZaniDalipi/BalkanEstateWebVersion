import React, { useState } from 'react';
import { PaperAirplaneIcon } from '../../constants';

interface MessageInputProps {
    onSendMessage: (text: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSendMessage(text.trim());
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
                placeholder="Type your message..."
                rows={1}
                className="block w-full text-base bg-white border border-neutral-300 rounded-full text-neutral-900 shadow-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                style={{ height: 'auto', minHeight: '50px' }}
            />
            <button type="submit" className="bg-primary text-white rounded-full p-3.5 hover:bg-primary-dark disabled:bg-primary/50 transition-colors flex-shrink-0 self-end">
                <PaperAirplaneIcon className="h-5 w-5" />
            </button>
        </form>
    );
};

export default MessageInput;
