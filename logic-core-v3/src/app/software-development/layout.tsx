import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Software a Medida en Tucumán | CRM, ERP y Sistemas | develOP",
    description: "Desarrollamos CRM, ERP y sistemas de gestión a medida para PyMEs de Tucumán y Argentina. Reemplazamos Excel y WhatsApp con soluciones que escalan. Desde $1.500 USD.",
    keywords: [
        "software a medida tucumán",
        "sistema de gestión argentina",
        "crm tucumán",
        "erp pymes argentina",
        "desarrollo software noa",
        "sistema administrativo tucumán",
        "automatización empresas argentina",
        "software empresarial tucumán",
        "crm personalizado argentina",
        "sistema de ventas tucumán",
        "desarrollo web tucumán",
        "plataforma saas argentina",
        "software gestión pymes",
        "agencia software tucumán",
    ],
    openGraph: {
        type: "website",
        locale: "es_AR",
        url: "https://develop.com.ar/software-development",
        siteName: "develOP",
        title: "Software a Medida para tu Empresa | develOP Tucumán",
        description: "CRM, ERP y sistemas de gestión para PyMEs del NOA. Reemplazamos el caos de Excel con soluciones que escalan. Cupos limitados.",
        images: [{ url: "/og-software.png", width: 1200, height: 630, alt: "Software a Medida develOP Tucumán" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Software a Medida para PyMEs | develOP Argentina",
        description: "CRM, ERP y sistemas a medida para empresas del NOA. Sin Excel, sin caos. Desde $1.500 USD.",
        images: ["/og-software.png"],
    },
    alternates: {
        canonical: "https://develop.com.ar/software-development",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-snippet": -1 },
    },
};

export default function SoftwareDevelopmentLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
