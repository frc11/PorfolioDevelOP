import {
  Bot, Clock, Eye, FileStack, Gauge, Globe, HeartHandshake, LayoutDashboard, LayoutGrid, MessageCircle, MessagesSquare, PiggyBank, Repeat, SearchX,
  ShoppingBag, ShoppingCart, TrendingUp, Users, Workflow, Zap, type LucideIcon,
} from 'lucide-react'

import type { IdDeSolucion } from './logica'

/**
 * [C2-51] LOS ÍCONOS DEL RECOMENDADOR — de `lucide-react` (ya en el proyecto), siempre con `strokeWidth={1.5}` (lo pone quien los
 * dibuja). Fuera de `logica.ts` para que la lógica siga pura: el orden es el de las opciones de cada pregunta.
 */
export const ICONOS_DE_LAS_OPCIONES: readonly (readonly LucideIcon[])[] = [
  [SearchX, MessageCircle, MessagesSquare, FileStack, Repeat],
  [Eye, ShoppingCart, Clock, LayoutGrid, Zap],
  [Users, TrendingUp, PiggyBank, Gauge, HeartHandshake],
]

export const ICONO_DE_LA_SOLUCION: Readonly<Record<IdDeSolucion, LucideIcon>> = {
  pagina: Globe,
  tienda: ShoppingBag,
  gestion: LayoutDashboard,
  chatbot: Bot,
  automatizacion: Workflow,
}
