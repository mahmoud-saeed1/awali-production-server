import { z } from 'zod';

export const createDealSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(200),
    client: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid client ID'),
    unit: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid unit ID'),
    stage: z.enum(['inquiry', 'viewing', 'negotiation', 'proposal', 'contract', 'closed_won', 'closed_lost']).default('inquiry'),
    value: z.object({
      amount: z.coerce.number().positive('Value must be positive'),
      currency: z.string().default('SAR'),
    }),
    expectedCloseDate: z.coerce.date().optional(),
    assignedTo: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
    notes: z.string().max(2000).optional(),
  }),
});

export const updateDealSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
  body: z.object({
    title: z.string().min(2).max(200).optional(),
    value: z.object({
      amount: z.coerce.number().positive().optional(),
      currency: z.string().optional(),
    }).optional(),
    expectedCloseDate: z.coerce.date().optional(),
    assignedTo: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    notes: z.string().max(2000).optional(),
  }),
});

export const updateStageSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
  body: z.object({
    stage: z.enum(['inquiry', 'viewing', 'negotiation', 'proposal', 'contract', 'closed_won', 'closed_lost']),
    lostReason: z.string().max(500).optional(),
  }),
});

export const recordPaymentSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
  body: z.object({
    amount: z.coerce.number().positive('Payment amount must be positive'),
    date: z.coerce.date(),
    method: z.enum(['cash', 'bank_transfer', 'cheque', 'credit_card']),
    reference: z.string().max(100).optional(),
    notes: z.string().max(500).optional(),
  }),
});

export type CreateDealDTO = z.infer<typeof createDealSchema>['body'];
export type UpdateDealDTO = z.infer<typeof updateDealSchema>['body'];
