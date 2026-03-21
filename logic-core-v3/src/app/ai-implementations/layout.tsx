import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Implementaciones de IA para Empresas en Argentina | develOP Tucumán",
    description: "Agentes de IA, chatbots y automatización inteligente para PyMEs de Tucumán y Argentina. IA que resuelve problemas reales: atención 24/7, ventas y operaciones. Desde $1.800 USD.",
    keywords: [
        "inteligencia artificial empresas argentina",
        "chatbot tucumán",
        "agente ia pymes",
        "ia para negocios argentina",
        "implementación ia noa",
        "automatización inteligente tucumán",
        "ia ventas argentina",
        "chatbot whatsapp argentina",
        "agente conversacional empresa",
        "ia atención al cliente pymes",
        "implementar ia sin programar",
        "inteligencia artificial tucumán",
        "ia para comercios argentina",
        "asistente virtual empresa argentina",
        "desarrollador ia noa",
    ],
    openGraph: {
        type: "website",
        locale: "es_AR",
        url: "https://develop.com.ar/ai-implementations",
        siteName: "develOP",
        title: "IA para tu Empresa | develOP Argentina",
        description: "Agentes de IA y automatización inteligente para PyMEs del NOA. Sin complejidad, con resultados medibles. Capacidad limitada.",
        images: [{ url: "/og-ia.png", width: 1200, height: 630, alt: "IA Empresas develOP Tucumán" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "IA para tu Empresa | develOP Argentina",
        description: "Agentes de IA y automatización inteligente para PyMEs. Sin complejidad, con resultados.",
        images: ["/og-ia.png"],
    },
    alternates: {
        canonical: "https://develop.com.ar/ai-implementations",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-snippet": -1 },
    },
};

export default function AIImplementationsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
