import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Desarrollo Web Profesional en Tucumán | Next.js Lighthouse 100 | develOP",
    description: "Páginas web y tiendas online para negocios del NOA. Next.js, Lighthouse 100, SEO en Google. Tu negocio abierto 24/7 desde $800 USD. Cupos limitados.",
    keywords: [
        "desarrollo web tucumán",
        "páginas web argentina",
        "diseño web noa",
        "seo tucumán",
        "tienda online argentina",
        "web profesional tucumán",
        "agencia web salta jujuy",
        "páginas web para pymes argentina",
        "diseño web profesional tucumán",
        "agencia digital noa",
        "web rápida next.js tucumán",
        "posicionamiento google tucumán",
        "tienda online tucumán",
        "web para restaurantes tucumán",
        "sucursal digital argentina",
    ],
    openGraph: {
        type: "website",
        locale: "es_AR",
        url: "https://develop.com.ar/web-development",
        siteName: "develOP",
        title: "Desarrollo Web que Trae Clientes | develOP Tucumán",
        description: "Páginas web y tiendas online para negocios del NOA. Posicionamiento en Google, velocidad < 2s. Desde $800 USD. Cupos limitados.",
        images: [{ url: "/og-web.png", width: 1200, height: 630, alt: "Desarrollo Web develOP Tucumán" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Desarrollo Web que Trae Clientes | develOP Tucumán",
        description: "Web profesional para negocios del NOA. Posicionamiento en Google y resultados reales desde $800 USD.",
        images: ["/og-web.png"],
    },
    alternates: {
        canonical: "https://develop.com.ar/web-development",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-snippet": -1 },
    },
};

export default function WebDevelopmentLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
