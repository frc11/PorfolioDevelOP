import { TaskStatus } from '@prisma/client'
import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

const emptyStringToNull = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

const emptyValueToUndefined = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  return value
}

const emptyValueToNull = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return value
}

export const ProjectIdSchema = z.string().cuid('Invalid project id')
export const TaskIdSchema = z.string().cuid('Invalid task id')
export const UserIdSchema = z.string().cuid('Invalid user id')

const optionalCreateStringSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().optional()
)
const optionalUpdateStringSchema = z.preprocess(
  emptyStringToNull,
  z.string().nullable().optional()
)
const optionalCreateAssignedToSchema = z.preprocess(
  emptyStringToUndefined,
  UserIdSchema.optional()
)
const optionalUpdateAssignedToSchema = z.preprocess(
  emptyStringToNull,
  UserIdSchema.nullable().optional()
)
const optionalCreateStatusSchema = z.preprocess(
  emptyStringToUndefined,
  z.nativeEnum(TaskStatus).optional()
)
const optionalUpdateStatusSchema = z.preprocess(
  emptyStringToUndefined,
  z.nativeEnum(TaskStatus).optional()
)
const optionalCreateEstimatedHoursSchema = z.preprocess(
  emptyValueToUndefined,
  z.coerce.number().nonnegative('Estimated hours must be zero or positive').optional()
)
const optionalUpdateEstimatedHoursSchema = z.preprocess(
  emptyValueToNull,
  z.coerce.number().nonnegative('Estimated hours must be zero or positive').nullable().optional()
)
const optionalPositionSchema = z.preprocess(
  emptyValueToUndefined,
  z.coerce.number().int().min(0, 'Position must be zero or positive').optional()
)

const titleSchema = z.string().trim().min(1, 'Title is required')

export const CreateTaskSchema = z.object({
  projectId: ProjectIdSchema,
  title: titleSchema,
  description: optionalCreateStringSchema,
  status: optionalCreateStatusSchema,
  estimatedHours: optionalCreateEstimatedHoursSchema,
  assignedToId: optionalCreateAssignedToSchema,
})

export const UpdateTaskSchema = z.object({
  taskId: TaskIdSchema,
  title: z.preprocess(emptyStringToUndefined, titleSchema.optional()),
  description: optionalUpdateStringSchema,
  status: optionalUpdateStatusSchema,
  estimatedHours: optionalUpdateEstimatedHoursSchema,
  assignedToId: optionalUpdateAssignedToSchema,
  position: optionalPositionSchema,
})

export const ReorderTasksSchema = z.object({
  tasks: z
    .array(
      z.object({
        id: TaskIdSchema,
        position: z.coerce.number().int().min(0, 'Position must be zero or positive'),
      })
    )
    .min(1, 'At least one task is required'),
})
