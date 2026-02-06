'use client';

import { useState } from 'react';
import { NeuroAvatar } from './NeuroAvatar';
import { ChatWindow } from './ChatWindow';
import { useLogicAI } from '../hooks/useLogicAI';

/**
 * Main AI Companion Wrapper
 * Combines NeuroAvatar with ChatWindow and manages state
 */
export function LogicCompanion() {
    const [isOpen, setIsOpen] = useState(false);
    const { messages, input, handleInputChange, handleSubmit, isThinking } = useLogicAI();

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* The Tesseract avatar - always visible, clickable to open chat */}
            <div onClick={toggleChat} role="button" aria-label="Toggle AI Chat">
                <NeuroAvatar isThinking={isThinking} />
            </div>

            {/* Chat Window - appears above avatar when open */}
            <ChatWindow
                messages={messages}
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isOpen={isOpen}
                isThinking={isThinking}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
