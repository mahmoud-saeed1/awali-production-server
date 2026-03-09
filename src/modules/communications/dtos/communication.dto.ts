import { z } from 'zod';

export const createCommunicationSchema = z.object({
  body: z.object({
    client: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid client ID'),
    type: z.enum(['phone_call', 'email', 'whatsapp', 'meeting', 'sms', 'other']),
    direction: z.enum(['inbound', 'outbound']),
    subject: z.string().min(2).max(200),
    content: z.string().max(5000).default(''),
    duration: z.coerce.number().int().min(0).optional(),
    outcome: z.enum(['successful', 'no_answer', 'voicemail', 'callback_requested', 'not_interested', 'follow_up_needed']).default('successful'),
    nextAction: z.string().max(500).optional(),
    nextActionDate: z.coerce.date().optional(),
    relatedDeal: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  }),
});

export type CreateCommunicationDTO = z.infer<typeof createCommunicationSchema>['body'];
