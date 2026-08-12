"use client";

import { usePathname } from "next/navigation";

import { shouldRunMarketingIntro } from "@/lib/marketing-routes";
import { MarketingIntro } from "@/components/ui/MarketingIntro";

/**
 * Punto de montaje del intro de las rutas de MARKETING.
 *
 * Hasta B2-S1 este archivo era, además, el orquestador de la coreografía del
 * home: velo negro, readiness gate del 3D, trazado del logo, lockup de texto,
 * hold de lectura, borrado, compresión. Esa rama murió entera.
 *
 * Por qué murió: escenificaba la aparición del canvas 3D del hero, y el hero
 * dejó de esperar al canvas. Lo que quedaba era costo puro — el scroll del home
 * se liberaba recién a los ~9,8 s, de los cuales 2,5 s eran el
 * `LOGO_READY_TIMEOUT_MS` que, sin canvas que esperar, habría pasado de ser un
 * tope a un impuesto fijo garantizado. Esconder el contenido hasta estar listo
 * no se paga.
 *
 * Lo que se conservó, intacto: la bifurcación de marketing. `MarketingIntro`
 * corre en `/web-development`, `/ai-implementations`, `/software-development`,
 * `/process-automation` y `/contact`, con su gate de hard-load, su propia
 * secuencia local y su red de seguridad de 6 s. Nunca corrió en el home y no
 * comparte con él canvas, promesa de readiness, máquina de estados ni lock de
 * scroll — solo dos componentes de UI (`LogoStrokeOverlay`, `IntroLockupText`),
 * que por eso se desconectaron del home pero NO se borraron.
 *
 * Este componente ya no escribe `PreloaderContext.phase` ni bloquea scroll en
 * ninguna ruta.
 */
export default function Preloader() {
    const pathname = usePathname();

    // Gate de disparo: SOLO hard-load / URL directa a una ruta de marketing (no
    // client-nav, que ya cubre el Shutter). En SSR devuelve `isMarketingRoute`,
    // así el velo va en el primer paint sin flash.
    if (shouldRunMarketingIntro(pathname)) {
        return <MarketingIntro />;
    }

    return null;
}
