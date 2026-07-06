export function maskSecret(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  return `••••••••${value.slice(-4)}`
}
