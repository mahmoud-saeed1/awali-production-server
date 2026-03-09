import { z } from 'zod';

export const createUnitSchema = z.object({
  body: z.object({
    unitNumber: z.string().min(1).max(50),
    buildingType: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid building type ID'),
    unitType: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid unit type ID'),
    features: z.array(z.string().regex(/^[a-f\d]{24}$/i)).optional().default([]),
    status: z.enum(['available', 'reserved', 'under_contract', 'sold', 'maintenance']).optional().default('available'),
    price: z.object({
      amount: z.coerce.number().positive('Price must be positive'),
      currency: z.string().default('SAR'),
    }),
    area: z.object({
      plot: z.coerce.number().positive().optional(),
      built: z.coerce.number().positive().optional(),
      unit: z.string().default('sqm'),
    }).optional(),
    specifications: z.object({
      bedrooms: z.coerce.number().int().min(0).optional(),
      bathrooms: z.coerce.number().int().min(0).optional(),
      floors: z.coerce.number().int().min(0).optional(),
      parkingSpaces: z.coerce.number().int().min(0).optional(),
    }).optional(),
    facade: z.enum(['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west']).optional(),
    description: z.object({
      en: z.string().max(2000).optional().default(''),
      ar: z.string().max(2000).optional().default(''),
    }).optional(),
    floor: z.coerce.number().int().optional(),
    map: z.object({
      latitude: z.coerce.number().optional(),
      longitude: z.coerce.number().optional(),
      address: z.string().max(500).optional(),
    }).optional(),
  }),
});

export const updateUnitSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
  body: z.object({
    unitNumber: z.string().min(1).max(50).optional(),
    buildingType: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    unitType: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    features: z.array(z.string().regex(/^[a-f\d]{24}$/i)).optional(),
    price: z.object({
      amount: z.coerce.number().positive().optional(),
      currency: z.string().optional(),
    }).optional(),
    area: z.object({
      plot: z.coerce.number().positive().optional(),
      built: z.coerce.number().positive().optional(),
      unit: z.string().optional(),
    }).optional(),
    specifications: z.object({
      bedrooms: z.coerce.number().int().min(0).optional(),
      bathrooms: z.coerce.number().int().min(0).optional(),
      floors: z.coerce.number().int().min(0).optional(),
      parkingSpaces: z.coerce.number().int().min(0).optional(),
    }).optional(),
    facade: z.enum(['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west']).optional(),
    description: z.object({ en: z.string().max(2000).optional(), ar: z.string().max(2000).optional() }).optional(),
    floor: z.coerce.number().int().optional(),
    map: z.object({
      latitude: z.coerce.number().optional(),
      longitude: z.coerce.number().optional(),
      address: z.string().max(500).optional(),
    }).optional(),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
  body: z.object({
    status: z.enum(['available', 'reserved', 'under_contract', 'sold', 'maintenance']),
  }),
});

export const publishSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
  body: z.object({
    isPublished: z.boolean(),
  }),
});

export const reorderImagesSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
  body: z.object({
    images: z.array(z.object({
      key: z.string(),
      order: z.coerce.number().int().min(0),
      isPrimary: z.boolean().optional(),
    })),
  }),
});

export type CreateUnitDTO = z.infer<typeof createUnitSchema>['body'];
export type UpdateUnitDTO = z.infer<typeof updateUnitSchema>['body'];
