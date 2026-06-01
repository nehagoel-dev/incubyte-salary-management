import type { Employee, Prisma } from '@prisma/client';
import { NotFoundError, ConflictError, ValidationError } from './../lib/errors.js';
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  ListEmployeesQuery,
} from '../schemas/employee.schema.js';

export interface EmployeeRepositoryPort {
  findMany(args: {
    where?: Prisma.EmployeeWhereInput;
    orderBy?: Prisma.EmployeeOrderByWithRelationInput;
    skip: number;
    take: number;
  }): Promise<Employee[]>;
  count(args?: { where?: Prisma.EmployeeWhereInput }): Promise<number>;
  findById(id: string): Promise<Employee | null>;
  create(data: CreateEmployeeInput): Promise<Employee>;
  update(id: string, data: UpdateEmployeeInput): Promise<Employee>;
  delete(id: string): Promise<void>;
}

const ALLOWED_SORT_FIELDS = [
  'lastName',
  'firstName',
  'baseSalaryCents',
  'hireDate',
  'department',
  'country',
] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

function buildOrderBy(sort?: string): Prisma.EmployeeOrderByWithRelationInput {
  if (sort === undefined) {
    return { lastName: 'asc' };
  }
  const [field, dir] = sort.split(':');
  if (
    !ALLOWED_SORT_FIELDS.includes(field as SortField) ||
    (dir !== 'asc' && dir !== 'desc')
  ) {
    throw new ValidationError(`Invalid sort parameter: ${sort}`);
  }
  return { [field]: dir } as Prisma.EmployeeOrderByWithRelationInput;
}

function hasPrismaCode(err: unknown, code: string): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === code
  );
}

const isUniqueConstraintError = (err: unknown): boolean => hasPrismaCode(err, 'P2002');
const isRecordNotFoundError = (err: unknown): boolean => hasPrismaCode(err, 'P2025');

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export class EmployeeService {
  constructor(private readonly repo: EmployeeRepositoryPort) {}

  async list({
    page,
    pageSize,
    search,
    department,
    country,
    sort,
  }: ListEmployeesQuery): Promise<Paginated<Employee>> {
    const where: Prisma.EmployeeWhereInput = {};
    if (department !== undefined) {
      where.department = department;
    }
    if (country !== undefined) {
      where.country = country;
    }
    if (search !== undefined) {
      const orConditions: Prisma.EmployeeWhereInput[] = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
      const parts = search.trim().split(/\s+/);
      if (parts.length >= 2) {
        orConditions.push({
          AND: [
            { firstName: { contains: parts[0], mode: 'insensitive' } },
            { lastName: { contains: parts.slice(1).join(' '), mode: 'insensitive' } },
          ],
        });
        orConditions.push({
          AND: [
            { firstName: { contains: parts.slice(1).join(' '), mode: 'insensitive' } },
            { lastName: { contains: parts[0], mode: 'insensitive' } },
          ],
        });
      }
      where.OR = orConditions;
    }

    const orderBy = buildOrderBy(sort);
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.repo.findMany({ where, orderBy, skip, take: pageSize }),
      this.repo.count({ where }),
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
    return this.run(() => this.repo.create(data));
  }

  async update(id: string, data: UpdateEmployeeInput): Promise<Employee> {
    return this.run(() => this.repo.update(id, data), id);
  }

  async delete(id: string): Promise<void> {
    return this.run(() => this.repo.delete(id), id);
  }

  /** Runs a repo write and translates known Prisma error codes to typed errors. */
  private async run<T>(op: () => Promise<T>, id?: string): Promise<T> {
    try {
      return await op();
    } catch (err) {
      if (isRecordNotFoundError(err)) {
        throw new NotFoundError(`Employee ${id} not found`);
      }
      if (isUniqueConstraintError(err)) {
        throw new ConflictError('An employee with this email already exists');
      }
      throw err;
    }
  }
}
