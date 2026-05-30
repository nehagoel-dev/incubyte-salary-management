import type { Employee } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from '../schemas/employee.schema.js';

export class EmployeeRepository {
  findMany(args: { skip: number; take: number }): Promise<Employee[]> {
    return prisma.employee.findMany(args);
  }

  count(): Promise<number> {
    return prisma.employee.count();
  }

  findById(id: string): Promise<Employee | null> {
    return prisma.employee.findUnique({ where: { id } });
  }

  create(data: CreateEmployeeInput): Promise<Employee> {
    return prisma.employee.create({ data });
  }

  update(id: string, data: UpdateEmployeeInput): Promise<Employee> {
    return prisma.employee.update({ where: { id }, data });
  }
}
