'use client';

import { Suspense } from 'react';
import { LogicCompanion } from '@/modules/ai-companion';

/**
 * Example integration for testing the NeuroAvatar
 * Add this to your layout.tsx temporarily to see it in action
 */
export default function TestNeuroAvatar() {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-center space-y-6">
                <h1 className="text-4xl font-bold text-zinc-100">
                    NeuroAvatar Test
                </h1>
                <p className="text-zinc-400 max-w-md mx-auto">
                    The Tesseract avatar should appear in the bottom-right corner.
                    <br />
                    Try hovering over it!
                </p>

                <div className="flex gap-4 justify-center">
                    <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors">
                        Click to trigger thinking state
                    </button>
                </div>
            </div>

            {/* The AI Companion */}
            <Suspense fallback={null}>
                <LogicCompanion />
            </Suspense>
        </div>
    );
}
