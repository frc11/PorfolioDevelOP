/** Fixture: una comprobación que corre y otra que NO. Ver `README.md`. */
import { afirmar, cerrar, noCorre } from '../afirmar'

afirmar(true, 'fixture D — esta comprobación sí corre')
noCorre('fixture D — ésta no', 'porque su base ya está en HEAD')
cerrar('fixture-fuera-de-ventana')
