import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').max(255).transform((e) => e.toLowerCase().trim()),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    name: z.object({
      en: z.string().min(2).max(100),
      ar: z.string().min(2).max(100),
    }),
    phone: z.string().min(8).max(20).optional(),
    role: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid role ID'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
  }),
  body: z.object({
    email: z.string().email().max(255).transform((e) => e.toLowerCase().trim()).optional(),
    name: z.object({
      en: z.string().min(2).max(100),
      ar: z.string().min(2).max(100),
    }).optional(),
    phone: z.string().min(8).max(20).optional(),
    role: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    avatar: z.string().url().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB ID format'),
  }),
});

export const listQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    sort: z.string().optional(),
    search: z.string().max(100).optional(),
    role: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    isActive: z.coerce.boolean().optional(),
  }),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>['body'];
export type UpdateUserDTO = z.infer<typeof updateUserSchema>['body'];
