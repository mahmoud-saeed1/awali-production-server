import { z } from 'zod';

export const createFeatureSchema = z.object({
  body: z.object({
    nameEn: z.string().min(2).max(100),
    nameAr: z.string().min(2).max(100),
    description: z.object({ en: z.string().max(500).optional().default(''), ar: z.string().max(500).optional().default('') }).optional(),
    category: z.enum(['amenity', 'characteristic', 'facility', 'service']),
    icon: z.string().max(50).optional(),
    order: z.coerce.number().int().min(0).optional(),
  }),
});

export const updateFeatureSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
  body: z.object({
    nameEn: z.string().min(2).max(100).optional(),
    nameAr: z.string().min(2).max(100).optional(),
    description: z.object({ en: z.string().max(500).optional(), ar: z.string().max(500).optional() }).optional(),
    category: z.enum(['amenity', 'characteristic', 'facility', 'service']).optional(),
    icon: z.string().max(50).optional(),
    order: z.coerce.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateFeatureDTO = z.infer<typeof createFeatureSchema>['body'];
export type UpdateFeatureDTO = z.infer<typeof updateFeatureSchema>['body'];
