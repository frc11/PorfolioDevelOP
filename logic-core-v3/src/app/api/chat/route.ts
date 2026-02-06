import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getContextualPrompt } from '@/modules/ai-companion/lib/constants';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

export async function POST(req: Request) {
    const requestId = crypto.randomUUID();

    try {
        const { messages, currentPath } = await req.json();
        const modelUsed = 'models/gemini-flash-latest';

        // Log starting request
        logger.ai('request', {
            requestId,
            model: modelUsed,
            currentPath,
            messageCount: messages?.length || 0
        });

        // Validate messages
        if (!messages || !Array.isArray(messages)) {
            logger.warn('Invalid messages format', { requestId });
            return new Response(JSON.stringify({ error: 'Invalid messages' }), { status: 400 });
        }

        // Get system prompt
        const systemPrompt = getContextualPrompt(currentPath);

        const result = await streamText({
            model: google(modelUsed),
            system: systemPrompt,
            messages,
            temperature: 0.7,
            onFinish: () => {
                logger.ai('success', { requestId, model: modelUsed });
            }
        });

        // Log streaming start
        logger.ai('streaming', { requestId, model: modelUsed });

        return result.toDataStreamResponse();

    } catch (error: any) {
        // Detailed error logging
        logger.ai('error', {
            requestId,
            message: error.message,
            stack: error.stack,
            raw: error
        });

        return new Response(JSON.stringify({
            error: "Neural Link Disrupted",
            details: error.message,
            requestId
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
