/** Fixture: pasa SIEMPRE. Sin él, un agregado que dijera "falla" a todo daría verde. */
import { afirmar, cerrar, controlPositivo } from '../afirmar'

afirmar(true, 'fixture C — esta afirmación pasa a propósito')
controlPositivo('y trae un control positivo, para que el contador tenga qué contar', 1, (n) => n === 2)
cerrar('fixture-pasa')
