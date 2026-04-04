import { OsTaskStatus } from '@prisma/client'
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

export const ProjectIdSchema = z.string().cuid('Invalid project id')
export const TaskIdSchema = z.string().cuid('Invalid task id')
export const UserIdSchema = z.string().cuid('Invalid user id')

const optionalStringSchema = z.preprocess(emptyStringToUndefined, z.string().optional())
const optionalAssignedToSchema = z.preprocess(
  emptyStringToUndefined,
  UserIdSchema.optional()
)
const optionalStatusSchema = z.preprocess(
  emptyStringToUndefined,
  z.nativeEnum(OsTaskStatus).optional()
)
const optionalEstimatedHoursSchema = z.preprocess(
  emptyValueToUndefined,
  z.coerce.number().nonnegative('Estimated hours must be zero or positive').optional()
)
const optionalPositionSchema = z.preprocess(
  emptyValueToUndefined,
  z.coerce.number().int().min(0, 'Position must be zero or positive').optional()
)

const titleSchema = z.string().trim().min(1, 'Title is required')

export const CreateTaskSchema = z.object({
  projectId: ProjectIdSchema,
  title: titleSchema,
  description: optionalStringSchema,
  status: optionalStatusSchema,
  estimatedHours: optionalEstimatedHoursSchema,
  assignedToId: optionalAssignedToSchema,
})

export const UpdateTaskSchema = z.object({
  taskId: TaskIdSchema,
  title: z.preprocess(emptyStringToUndefined, titleSchema.optional()),
  description: optionalStringSchema,
  status: optionalStatusSchema,
  estimatedHours: optionalEstimatedHoursSchema,
  assignedToId: optionalAssignedToSchema,
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
