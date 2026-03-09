import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.object({ en: z.string().min(2).max(200), ar: z.string().max(200).default('') }),
    description: z.string().max(2000).optional(),
    type: z.enum(['follow_up', 'meeting', 'call', 'viewing', 'document_request', 'other']).default('other'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    dueDate: z.coerce.date(),
    assignedTo: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
    relatedClient: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    relatedDeal: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    relatedUnit: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    reminderDate: z.coerce.date().optional(),
    notes: z.string().max(2000).optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
  body: createTaskSchema.shape.body.partial(),
});

export const completeTaskSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>['body'];
