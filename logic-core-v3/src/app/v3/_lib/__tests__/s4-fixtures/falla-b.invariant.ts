/** Fixture: falla SIEMPRE, y va después de A para probar que A no la tapa. */
import { afirmar, cerrar } from '../afirmar'

afirmar(false, 'fixture B — esta afirmación falla a propósito, y corre DESPUÉS de A')
cerrar('fixture-falla-b')
