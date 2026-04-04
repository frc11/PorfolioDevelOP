import { z } from 'zod'

export const MilestoneIdSchema = z.string().cuid('Invalid milestone id')
