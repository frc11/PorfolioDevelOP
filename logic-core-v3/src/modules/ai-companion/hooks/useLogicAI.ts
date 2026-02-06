'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
import { INITIAL_GREETING } from '../lib/constants';

/**
 * Custom hook for Logic AI with dynamic context awareness
 * Automatically adapts AI responses based on current route
 * Supports client-side tool calling for navigation
 */
export function useLogicAI() {
    const pathname = usePathname();
    const router = useRouter();
    const processedMessageIds = useRef<Set<string>>(new Set());

    const {
        messages,
        input,
        handleInputChange,
        handleSubmit: originalHandleSubmit,
        isLoading,
        error,
    } = useChat({
        api: '/api/chat',
        initialMessages: [
            {
                id: 'intro-msg',
                role: 'assistant',
                content: INITIAL_GREETING,
            },
        ],
        // Inject current path into every request
        body: {
            currentPath: pathname,
        },
        onError: (error: Error) => {
            console.error('Chat error:', error);
        },
    });

    // Wrap submit to ensure we always pass the latest pathname
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        originalHandleSubmit(e, {
            body: {
                currentPath: pathname,
            },
        });
    };

    // Client-Side Tool Calling: Navigation Protocol
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];

        if (
            lastMessage?.role === 'assistant' &&
            !processedMessageIds.current.has(lastMessage.id)
        ) {
            const content = (lastMessage as any).content || '';
            const match = content.match(/\[NAVIGATE:\s*(.*?)\]/);

            if (match) {
                const path = match[1].trim();
                console.log('🤖 AI Navigation Command Executed:', path);

                // Mark as processed
                processedMessageIds.current.add(lastMessage.id);

                // Execute navigation
                router.push(path);

                // Optional: Show toast notification
                if (typeof window !== 'undefined') {
                    console.log('✨ Navigating to:', path);
                }
            }
        }
    }, [messages, router]);

    return {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isThinking: isLoading,
        error,
    };
}
