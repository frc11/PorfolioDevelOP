import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contacto | develOP — Agencia Digital Tucumán",
    description: "Contactate con develOP en Tucumán. Desarrollo web, software a medida, automatización e IA para tu negocio. Respondemos en menos de 24 horas.",
    keywords: ["contacto agencia digital tucumán", "contratar desarrollo web argentina", "presupuesto software tucumán", "agencia develOP contacto", "desarrollo digital noa presupuesto"],
    openGraph: {
        type: "website",
        locale: "es_AR",
        url: "https://develop.com.ar/contact",
        siteName: "develOP",
        title: "Contacto | develOP Tucumán",
        description: "Hablemos de tu proyecto. Desarrollo web, software, automatización e IA. Respondemos en menos de 24h.",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Contacto develOP" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Contacto | develOP Tucumán",
        description: "Hablemos de tu proyecto. Respondemos en menos de 24h.",
        images: ["/og-image.png"],
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
