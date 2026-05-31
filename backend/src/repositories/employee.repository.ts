import type { Employee, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from '../schemas/employee.schema.js';

export class EmployeeRepository {
  findMany(args: {
    where?: Prisma.EmployeeWhereInput;
    orderBy?: Prisma.EmployeeOrderByWithRelationInput;
    skip: number;
    take: number;
  }): Promise<Employee[]> {
    return prisma.employee.findMany(args);
  }

  count(args?: { where?: Prisma.EmployeeWhereInput }): Promise<number> {
    return prisma.employee.count(args);
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

  async delete(id: string): Promise<void> {
    await prisma.employee.delete({ where: { id } });
  }
}
