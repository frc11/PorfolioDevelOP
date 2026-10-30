/**
 * [SERVICIOS S1a] LA FUENTE DE LOS PROYECTOS (O-6, plan §8.3).
 *
 * La única línea de servicios que sabe de dónde salen los proyectos del portfolio. De cada uno se toma el nombre,
 * el rubro, la url y el póster; servicios suma solo su texto (SPEC §7.1) y nunca lee `resena`, `problemaResuelto`,
 * `problemaCliente`, `queHicimos` ni `resultado`: desde B1.1b varios pasan por la llave del contenido inventado y,
 * con la llave apagada, son marcadores.
 */

export { PROYECTOS as FUENTE_DE_PROYECTOS } from '../../_secciones/trabajos/proyectos'
