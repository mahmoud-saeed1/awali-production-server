import { z } from 'zod';

export const registerSchema = z.object({
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
      en: z.string().min(2, 'English name required').max(100),
      ar: z.string().min(2, 'Arabic name required').max(100),
    }),
    phone: z.string().min(8).max(20).optional(),
    role: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid role ID').optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').transform((e) => e.toLowerCase().trim()),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export type RegisterDTO = z.infer<typeof registerSchema>['body'];
export type LoginDTO = z.infer<typeof loginSchema>['body'];
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>['body'];
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>['body'];
