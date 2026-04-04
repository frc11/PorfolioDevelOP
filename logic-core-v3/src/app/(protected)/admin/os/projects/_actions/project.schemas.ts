import { OsProjectStatus, OsServiceType } from '@prisma/client'
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

const optionalStringSchema = z.preprocess(emptyStringToUndefined, z.string().optional())
const optionalEmailSchema = z.preprocess(emptyStringToUndefined, z.string().email().optional())
const optionalDateSchema = z.preprocess(emptyValueToUndefined, z.coerce.date().optional())
const positiveNumberSchema = z.preprocess(
  emptyValueToUndefined,
  z.coerce.number().positive('Amount must be positive')
)
const optionalPositiveNumberSchema = z.preprocess(
  emptyValueToUndefined,
  z.coerce.number().positive('Amount must be positive').optional()
)

export const ProjectIdSchema = z.string().cuid('Invalid project id')
export const LeadIdSchema = z.string().cuid('Invalid lead id')

export const CreateProjectSchema = z.object({
  businessName: z.string().trim().min(1, 'Business name is required'),
  contactName: z.string().trim().min(1, 'Contact name is required'),
  contactPhone: optionalStringSchema,
  contactEmail: optionalEmailSchema,
  name: z.string().trim().min(1, 'Project name is required'),
  description: optionalStringSchema,
  serviceType: z.nativeEnum(OsServiceType),
  agreedAmount: positiveNumberSchema,
  monthlyRate: optionalPositiveNumberSchema,
  estimatedEndDate: optionalDateSchema,
  leadId: z.preprocess(emptyStringToUndefined, LeadIdSchema.optional()),
})

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  projectId: ProjectIdSchema,
})

export const UpdateProjectStatusSchema = z.object({
  projectId: ProjectIdSchema,
  status: z.nativeEnum(OsProjectStatus),
})

export const ConvertLeadToProjectSchema = z.object({
  leadId: LeadIdSchema,
  name: z.string().trim().min(1, 'Project name is required'),
  description: optionalStringSchema,
  agreedAmount: positiveNumberSchema,
  monthlyRate: optionalPositiveNumberSchema,
  estimatedEndDate: optionalDateSchema,
})
