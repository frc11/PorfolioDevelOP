/**
 * Fixture: DECLARA UNA DEUDA y pasa. B8 agregó `deudaDeclarada()` a `afirmar.ts`:
 * una afirmación que corre con su condición intacta, cuenta aparte cuando
 * falla y no pone al invariante en rojo. Este fixture existe para que el
 * corredor demuestre las dos mitades a la vez: que la deuda se cuenta, y que
 * no se confunde con una falla.
 */
import { afirmar, cerrar, deudaDeclarada } from '../afirmar'

afirmar(true, 'fixture D — esta afirmación pasa a propósito')
deudaDeclarada(false, 'y esta NO se cumple, a propósito: es una deuda declarada, no una falla', 'la condición es `false` y así queda', 'nunca — es un fixture')
cerrar('fixture-deuda')
