import type { Employee } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

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
}
