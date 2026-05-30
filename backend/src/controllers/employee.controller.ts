import type { RequestHandler } from 'express';
import { z } from 'zod';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from '../schemas/employee.schema.js';

/** Port the controller needs — satisfied structurally by EmployeeService. */
export interface EmployeeListService {
  list(params: { page: number; pageSize: number }): Promise<unknown>;
  getById(id: string): Promise<unknown>;
  create(data: CreateEmployeeInput): Promise<unknown>;
  update(id: string, data: UpdateEmployeeInput): Promise<unknown>;
  delete(id: string): Promise<unknown>;
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

  const create: RequestHandler = async (req, res, next) => {
    try {
      const data = createEmployeeSchema.parse(req.body);
      const created = await service.create(data);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  };

  const update: RequestHandler = async (req, res, next) => {
    try {
      const data = updateEmployeeSchema.parse(req.body);
      const updated = await service.update(req.params.id, data);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  const remove: RequestHandler = async (req, res, next) => {
    try {
      await service.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };

  return { list, getById, create, update, remove };
}
