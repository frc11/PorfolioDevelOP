'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useChat } from 'ai/react';
import { useEffect, useRef, useState } from 'react';
import { INITIAL_GREETING } from '../lib/constants';
import {
    detectIntent,
    generateWhatsAppLink,
    type LeadContext,
    type ServiceType,
} from '../lib/sales-strategy';

/** Safely extract text content from AI SDK messages */
function getTextContent(message: any): string {
    const content = message?.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content
            .filter((part: any) => part?.type === 'text')
            .map((part: any) => part.text || '')
            .join('');
    }
    return '';
}

/**
 * Custom hook for Logic AI with dynamic context awareness
 * Automatically adapts AI responses based on current route
 * Supports client-side tool calling for navigation
 */
export function useLogicAI() {
    const pathname = usePathname();
    const router = useRouter();
    const processedMessageIds = useRef<Set<string>>(new Set());
    const [leadContext, setLeadContext] = useState<LeadContext>({
        serviceType: 'unknown',
    });

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
            const content = getTextContent(lastMessage);

            // Detect WhatsApp connection command
            const whatsappMatch = content.match(/\[CONNECT_WHATSAPP\]/);
            if (whatsappMatch) {
                const whatsappLink = generateWhatsAppLink(leadContext);
                processedMessageIds.current.add(lastMessage.id);

                // Open WhatsApp in new tab
                if (typeof window !== 'undefined') {
                    window.open(whatsappLink, '_blank');
                }
            }

            // Detect navigation command
            const navMatch = content.match(/\[NAVIGATE:\s*(.*?)\]/);
            if (navMatch) {
                const path = navMatch[1].trim();

                // Mark as processed
                processedMessageIds.current.add(lastMessage.id);

                // Execute navigation
                router.push(path);
            }
        }
    }, [messages, router, leadContext]);

    // Intent detection on user messages
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];

        if (lastMessage?.role === 'user') {
            const content = getTextContent(lastMessage);
            const detectedIntent = detectIntent(content);

            if (detectedIntent !== 'unknown') {
                setLeadContext(prev => ({
                    ...prev,
                    serviceType: detectedIntent,
                }));
            }
        }
    }, [messages]);

    return {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isThinking: isLoading,
        error,
        leadContext,
        updateLeadContext: setLeadContext,
    };
}
