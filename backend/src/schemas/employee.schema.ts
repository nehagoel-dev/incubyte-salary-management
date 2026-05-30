import { z } from 'zod';

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  department: z.string().min(1),
  jobTitle: z.string().min(1),
  country: z.string().regex(/^[A-Z]{2}$/, 'country must be a 2-letter ISO code'),
  currency: z.string().regex(/^[A-Z]{3}$/, 'currency must be a 3-letter ISO code'),
  baseSalaryCents: z.number().int().positive(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
  hireDate: z.coerce.date(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = createEmployeeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
