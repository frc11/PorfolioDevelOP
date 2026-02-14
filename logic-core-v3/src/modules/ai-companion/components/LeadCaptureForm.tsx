'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Mail } from 'lucide-react';
import { generateWhatsAppLink, type LeadContext } from '../lib/sales-strategy';

interface LeadCaptureFormProps {
    leadContext: LeadContext;
    onConnect: () => void;
}

/**
 * LeadCaptureForm — Inline CTA that appears in the chat
 * when Logic Core determines the lead is ready to connect.
 * Shows WhatsApp (primary) and Email (backup) options.
 */
export function LeadCaptureForm({ leadContext, onConnect }: LeadCaptureFormProps) {
    const whatsappLink = generateWhatsAppLink(leadContext);

    const handleWhatsApp = () => {
        onConnect();
        if (typeof window !== 'undefined') {
            window.open(whatsappLink, '_blank');
        }
    };

    const handleEmail = () => {
        if (typeof window !== 'undefined') {
            window.open(
                'mailto:develop33.arg@gmail.com?subject=Consulta%20desde%20Logic%20Core',
                '_blank',
            );
        }
    };

    return (
        <div className="w-full max-w-[90%] space-y-2.5">
            {/* WhatsApp — primary CTA */}
            <motion.button
                onClick={handleWhatsApp}
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 211, 238, 0.25)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono uppercase tracking-[0.15em] transition-colors hover:border-cyan-400/50"
            >
                <MessageCircle className="w-4 h-4" />
                Conectar por WhatsApp
            </motion.button>

            {/* Email — secondary CTA */}
            <motion.button
                onClick={handleEmail}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-zinc-500 text-[10px] font-mono uppercase tracking-[0.15em] transition-colors hover:text-zinc-400 hover:border-white/20"
            >
                <Mail className="w-3.5 h-3.5" />
                O escribinos por email
            </motion.button>
        </div>
    );
}
