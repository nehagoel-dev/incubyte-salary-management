import type { Employee } from '@prisma/client';
import { NotFoundError, ConflictError } from './../lib/errors.js';
import type { CreateEmployeeInput } from '../schemas/employee.schema.js';

export interface EmployeeReadRepository {
  findMany(args: { skip: number; take: number }): Promise<Employee[]>;
  count(): Promise<number>;
  findById(id: string): Promise<Employee | null>;
  create(data: CreateEmployeeInput): Promise<Employee>;
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 'P2002'
  );
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export class EmployeeService {
  constructor(private readonly repo: EmployeeReadRepository) {}

  async list({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }): Promise<Paginated<Employee>> {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.repo.findMany({ skip, take: pageSize }),
      this.repo.count(),
    ]);
    return { data, total, page, pageSize };
  }

  async getById(id: string): Promise<Employee> {
    const employee = await this.repo.findById(id);
    if (employee === null) {
      throw new NotFoundError(`Employee ${id} not found`);
    }
    return employee;
  }

  async create(data: CreateEmployeeInput): Promise<Employee> {
    try {
      return await this.repo.create(data);
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw new ConflictError('An employee with this email already exists');
      }
      throw err;
    }
  }
}
