import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Automatización de Procesos en Argentina | n8n, IA | develOP Tucumán",
    description: "Automatizamos los procesos repetitivos de tu PyME con n8n e IA. Tucumán y Argentina. Ahorrá 22 hs semanales por empleado. Cupos limitados.",
    keywords: [
        "automatización procesos argentina",
        "n8n tucumán",
        "automatización empresas noa",
        "flujos de trabajo automáticos",
        "integración sistemas argentina",
        "eliminar tareas manuales pymes",
        "automatización pymes argentina",
        "n8n implementación argentina",
        "automatización whatsapp crm",
        "procesos automáticos tucumán",
        "make zapier alternativa argentina",
        "ahorro tiempo automatización empresa",
        "integración apis argentina",
        "workflow automation tucumán",
        "digitalización pymes noa",
    ],
    openGraph: {
        type: "website",
        locale: "es_AR",
        url: "https://develop.com.ar/process-automation",
        siteName: "develOP",
        title: "Automatización de Procesos | develOP Argentina",
        description: "Eliminamos tareas repetitivas con n8n e IA. Tu equipo deja de copiar datos y empieza a vender. 22 hs ahorradas por semana. Cupos limitados.",
        images: [{ url: "/og-automation.png", width: 1200, height: 630, alt: "Automatización develOP Tucumán" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Automatización de Procesos | develOP Argentina",
        description: "Eliminamos tareas repetitivas con n8n. Tu equipo ahorra 22 hs semanales y se enfoca en vender.",
        images: ["/og-automation.png"],
    },
    alternates: {
        canonical: "https://develop.com.ar/process-automation",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-snippet": -1 },
    },
};

export default function ProcessAutomationLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
