import type { RequestHandler } from 'express';
import { z } from 'zod';

/** Port the controller needs — satisfied structurally by EmployeeService. */
export interface EmployeeListService {
  list(params: { page: number; pageSize: number }): Promise<unknown>;
  getById(id: string): Promise<unknown>;
}

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export function makeEmployeeController(service: EmployeeListService) {
  const list: RequestHandler = async (req, res, next) => {
    try {
      const { page, pageSize } = listQuerySchema.parse(req.query);
      const result = await service.list({ page, pageSize });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  const getById: RequestHandler = async (req, res, next) => {
    try {
      const result = await service.getById(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  return { list, getById };
}
