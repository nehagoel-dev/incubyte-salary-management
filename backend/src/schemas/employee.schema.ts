import { z } from 'zod';

const countryCode = z
  .string()
  .regex(/^[A-Z]{2}$/, 'country must be a 2-letter ISO code');

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  department: z.string().min(1),
  jobTitle: z.string().min(1),
  country: countryCode,
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

export const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  country: countryCode.optional(),
  sort: z.string().regex(/^[a-zA-Z]+:(asc|desc)$/).optional(),
});

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;
