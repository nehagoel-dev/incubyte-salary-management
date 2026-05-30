import type { Employee } from '@prisma/client';

export interface EmployeeReadRepository {
  findMany(args: { skip: number; take: number }): Promise<Employee[]>;
  count(): Promise<number>;
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
}
