import { z } from 'zod'

export const MilestoneIdSchema = z.string().trim().min(1, 'Invalid milestone id')
