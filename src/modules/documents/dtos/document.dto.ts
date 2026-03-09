import { z } from 'zod';

export const createDocumentSchema = z.object({
  body: z.object({
    name: z.object({ en: z.string().min(2).max(200), ar: z.string().max(200).default('') }),
    type: z.enum(['contract', 'deed', 'id_copy', 'floor_plan', 'proposal', 'invoice', 'receipt', 'other']).default('other'),
    relatedClient: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    relatedDeal: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    relatedUnit: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    tags: z.array(z.string().max(50)).optional().default([]),
  }),
});

export type CreateDocumentDTO = z.infer<typeof createDocumentSchema>['body'];
