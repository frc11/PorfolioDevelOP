import { z } from 'zod'

export const alertIdSchema = z.string().cuid()
