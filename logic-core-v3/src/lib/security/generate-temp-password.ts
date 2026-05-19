import { randomBytes } from 'crypto'

// Sin caracteres confusos: sin 0/O/1/l/I
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz'
const NUMBERS = '23456789'
const SPECIALS = '!@#$%&*'

function randomFromString(str: string, length: number): string {
  const bytes = randomBytes(length)
  return Array.from(bytes)
    .map((b) => str[b % str.length])
    .join('')
}

export function generateTempPassword(): string {
  return (
    randomFromString(LETTERS, 4) +
    randomFromString(NUMBERS, 2) +
    randomFromString(SPECIALS, 2)
  )
}
