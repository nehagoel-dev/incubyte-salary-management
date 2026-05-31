import {
  createEmployeeSchema,
  updateEmployeeSchema,
  listEmployeesQuerySchema,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  type ListEmployeesQuery,
} from '../schemas/employee.schema.js';
import { asyncHandler } from '../lib/async-handler.js';

/** Port the controller needs — satisfied structurally by EmployeeService. */
export interface EmployeeServicePort {
  list(params: ListEmployeesQuery): Promise<unknown>;
  getById(id: string): Promise<unknown>;
  create(data: CreateEmployeeInput): Promise<unknown>;
  update(id: string, data: UpdateEmployeeInput): Promise<unknown>;
  delete(id: string): Promise<unknown>;
}

export function makeEmployeeController(service: EmployeeServicePort) {
  const list = asyncHandler(async (req, res) => {
    res.json(await service.list(listEmployeesQuerySchema.parse(req.query)));
  });

  const getById = asyncHandler(async (req, res) => {
    res.json(await service.getById(req.params.id));
  });

  const create = asyncHandler(async (req, res) => {
    const data = createEmployeeSchema.parse(req.body);
    res.status(201).json(await service.create(data));
  });

  const update = asyncHandler(async (req, res) => {
    const data = updateEmployeeSchema.parse(req.body);
    res.json(await service.update(req.params.id, data));
  });

  const remove = asyncHandler(async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).end();
  });

  return { list, getById, create, update, remove };
}
