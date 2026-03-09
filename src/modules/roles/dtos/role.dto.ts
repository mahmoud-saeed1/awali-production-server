import { z } from 'zod';

const permissionAction = z.object({
  create: z.boolean().default(false),
  read: z.boolean().default(false),
  update: z.boolean().default(false),
  delete: z.boolean().default(false),
});

export const createRoleSchema = z.object({
  body: z.object({
    nameEn: z.string().min(2).max(100),
    nameAr: z.string().min(2).max(100),
    description: z.object({
      en: z.string().max(500).optional().default(''),
      ar: z.string().max(500).optional().default(''),
    }).optional(),
    permissions: z.record(z.string(), permissionAction),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid role ID'),
  }),
  body: z.object({
    nameEn: z.string().min(2).max(100).optional(),
    nameAr: z.string().min(2).max(100).optional(),
    description: z.object({
      en: z.string().max(500).optional(),
      ar: z.string().max(500).optional(),
    }).optional(),
    permissions: z.record(z.string(), permissionAction).optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateRoleDTO = z.infer<typeof createRoleSchema>['body'];
export type UpdateRoleDTO = z.infer<typeof updateRoleSchema>['body'];
