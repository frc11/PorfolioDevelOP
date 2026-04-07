import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

const emptyValueToUndefined = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  return value
}

export const TaskIdSchema = z.string().trim().min(1, 'Invalid task id')
export const EntryIdSchema = z.string().trim().min(1, 'Invalid time entry id')
export const ProjectIdSchema = z.string().trim().min(1, 'Invalid project id')
export const UserIdSchema = z.string().trim().min(1, 'Invalid user id')

const positiveHoursSchema = z.preprocess(
  emptyValueToUndefined,
  z.coerce.number().positive('Hours must be positive')
)
const optionalPositiveHoursSchema = z.preprocess(
  emptyValueToUndefined,
  z.coerce.number().positive('Hours must be positive').optional()
)
const dateSchema = z.preprocess(emptyValueToUndefined, z.coerce.date())
const optionalDateSchema = z.preprocess(emptyValueToUndefined, z.coerce.date().optional())
const optionalNotesSchema = z.preprocess(emptyStringToUndefined, z.string().optional())

export const CreateTimeEntrySchema = z.object({
  taskId: TaskIdSchema,
  hours: positiveHoursSchema,
  date: dateSchema,
  notes: optionalNotesSchema,
})

export const UpdateTimeEntrySchema = z.object({
  entryId: EntryIdSchema,
  hours: optionalPositiveHoursSchema,
  date: optionalDateSchema,
  notes: optionalNotesSchema,
})

export const DateRangeSchema = z
  .object({
    from: optionalDateSchema,
    to: optionalDateSchema,
  })
  .optional()
