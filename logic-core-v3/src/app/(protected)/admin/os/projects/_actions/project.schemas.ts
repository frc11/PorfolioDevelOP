import { OsServiceType, ProjectStatus, ServiceType } from '@prisma/client'
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
const optionalPositiveNumberSchema = z.preprocess(
  emptyValueToUndefined,
  z.coerce.number().positive('Amount must be positive').optional()
)

const serviceTypeSchema = z.preprocess(
  emptyStringToUndefined,
  z.union([z.nativeEnum(ServiceType), z.nativeEnum(OsServiceType)]).optional()
)

const projectStatusSchema = z.preprocess(
  emptyStringToUndefined,
  z.nativeEnum(ProjectStatus)
)

export const ProjectIdSchema = z.string().trim().min(1, 'Invalid project id')
export const LeadIdSchema = z.string().trim().min(1, 'Invalid lead id')
export const OrganizationIdSchema = z.preprocess(
  (value) => {
    if (value === '') {
      return null
    }

    return emptyStringToUndefined(value)
  },
  z.string().trim().min(1, 'Invalid organization id').nullable().optional()
)

export const CreateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  description: optionalStringSchema,
  organizationId: OrganizationIdSchema,
  serviceType: serviceTypeSchema,
  agreedAmount: optionalPositiveNumberSchema,
  monthlyRate: optionalPositiveNumberSchema,
  estimatedEndDate: optionalDateSchema,

  // Legacy transitional fields kept optional while the UI still migrates.
  businessName: optionalStringSchema,
  contactName: optionalStringSchema,
  contactPhone: optionalStringSchema,
  contactEmail: optionalEmailSchema,
  leadId: z.preprocess(emptyStringToUndefined, LeadIdSchema.optional()),
})

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  projectId: ProjectIdSchema,
})

export const UpdateProjectStatusSchema = z.object({
  projectId: ProjectIdSchema,
  status: projectStatusSchema,
})

export const ConvertLeadToProjectSchema = z.object({
  leadId: LeadIdSchema,
  name: z.string().trim().min(1, 'Project name is required'),
  agreedAmount: optionalPositiveNumberSchema,
  monthlyRate: optionalPositiveNumberSchema,
  estimatedEndDate: optionalDateSchema,
  organizationId: OrganizationIdSchema,

  // Transitional optional field to preserve the current dialog.
  description: optionalStringSchema,
})
