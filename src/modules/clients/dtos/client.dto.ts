import { z } from 'zod';

export const createClientSchema = z.object({
  body: z.object({
    name: z.object({ en: z.string().min(2).max(100), ar: z.string().min(2).max(100) }),
    email: z.string().email().max(255).transform((e) => e.toLowerCase().trim()).optional(),
    phone: z.string().min(8).max(20),
    secondaryPhone: z.string().min(8).max(20).optional(),
    type: z.enum(['individual', 'company']).default('individual'),
    companyName: z.string().max(200).optional(),
    source: z.enum(['website', 'referral', 'social_media', 'walk_in', 'phone', 'advertising', 'exhibition', 'other']).optional(),
    assignedTo: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    interestedIn: z.array(z.string().regex(/^[a-f\d]{24}$/i)).optional().default([]),
    budget: z.object({
      min: z.coerce.number().min(0).optional(),
      max: z.coerce.number().min(0).optional(),
      currency: z.string().default('SAR'),
    }).optional(),
    preferences: z.object({
      bedrooms: z.coerce.number().int().min(0).optional(),
      bathrooms: z.coerce.number().int().min(0).optional(),
      minArea: z.coerce.number().min(0).optional(),
      maxArea: z.coerce.number().min(0).optional(),
      preferredLocations: z.array(z.string()).optional(),
      unitTypes: z.array(z.string().regex(/^[a-f\d]{24}$/i)).optional(),
      features: z.array(z.string().regex(/^[a-f\d]{24}$/i)).optional(),
    }).optional(),
    notes: z.string().max(2000).optional(),
    tags: z.array(z.string().max(50)).optional(),
    nationalId: z.string().max(20).optional(),
    address: z.string().max(500).optional(),
  }),
});

export const updateClientSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
  body: createClientSchema.shape.body.partial(),
});

export const updateStatusSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
  body: z.object({
    status: z.enum(['new', 'contacted', 'interested', 'qualified', 'negotiating', 'won', 'lost']),
    lostReason: z.string().max(500).optional(),
  }),
});

export const assignClientSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
  body: z.object({
    assignedTo: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
  }),
});

export type CreateClientDTO = z.infer<typeof createClientSchema>['body'];
export type UpdateClientDTO = z.infer<typeof updateClientSchema>['body'];
