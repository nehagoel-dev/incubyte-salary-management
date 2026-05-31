import { describe, it, expect, vi } from 'vitest';
import { EmployeeService } from './employee.service.js';
import { NotFoundError, ConflictError, ValidationError } from '../lib/errors.js';

describe('EmployeeService.list', () => {
  it('returns { data, total, page, pageSize } and queries the repo with the right offset', async () => {
    const employees = [{ id: '1' }, { id: '2' }];
    const repo = {
      findMany: vi.fn().mockResolvedValue(employees),
      count: vi.fn().mockResolvedValue(42),
    };
    const service = new EmployeeService(
      repo as unknown as ConstructorParameters<typeof EmployeeService>[0],
    );

    const result = await service.list({ page: 2, pageSize: 10 });

    expect(repo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
    expect(repo.count).toHaveBeenCalled();
    expect(result).toEqual({ data: employees, total: 42, page: 2, pageSize: 10 });
  });
});

describe('EmployeeService.getById', () => {
  it('returns the employee when the repo finds it', async () => {
    const employee = { id: 'e1' };
    const repo = {
      findMany: vi.fn(),
      count: vi.fn(),
      findById: vi.fn().mockResolvedValue(employee),
    };
    const service = new EmployeeService(
      repo as unknown as ConstructorParameters<typeof EmployeeService>[0],
    );

    const result = await service.getById('e1');

    expect(repo.findById).toHaveBeenCalledWith('e1');
    expect(result).toBe(employee);
  });

  it('throws NotFoundError when the repo returns null', async () => {
    const repo = {
      findMany: vi.fn(),
      count: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
    };
    const service = new EmployeeService(
      repo as unknown as ConstructorParameters<typeof EmployeeService>[0],
    );

    await expect(service.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('EmployeeService.create', () => {
  const input = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    department: 'Engineering',
    jobTitle: 'Engineer',
    country: 'GB',
    currency: 'GBP',
    baseSalaryCents: 5_000_000,
    employmentType: 'FULL_TIME',
    hireDate: new Date('2020-01-15'),
  };

  it('forwards validated data to repo.create and returns the created employee', async () => {
    const created = { id: 'e1', ...input };
    const repo = {
      findMany: vi.fn(),
      count: vi.fn(),
      findById: vi.fn(),
      create: vi.fn().mockResolvedValue(created),
    };
    const service = new EmployeeService(
      repo as unknown as ConstructorParameters<typeof EmployeeService>[0],
    );

    const result = await service.create(
      input as Parameters<EmployeeService['create']>[0],
    );

    expect(repo.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });

  it('throws ConflictError on a Prisma P2002 unique-constraint error', async () => {
    const p2002 = Object.assign(new Error('Unique constraint failed'), {
      code: 'P2002',
    });
    const repo = {
      findMany: vi.fn(),
      count: vi.fn(),
      findById: vi.fn(),
      create: vi.fn().mockRejectedValue(p2002),
    };
    const service = new EmployeeService(
      repo as unknown as ConstructorParameters<typeof EmployeeService>[0],
    );

    await expect(
      service.create(input as Parameters<EmployeeService['create']>[0]),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

describe('EmployeeService.update', () => {
  const patch = { jobTitle: 'Senior Engineer' };

  it('forwards to repo.update and returns the updated employee', async () => {
    const updated = { id: 'e1', jobTitle: 'Senior Engineer' };
    const repo = {
      findMany: vi.fn(),
      count: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(updated),
    };
    const service = new EmployeeService(
      repo as unknown as ConstructorParameters<typeof EmployeeService>[0],
    );

    const result = await service.update(
      'e1',
      patch as Parameters<EmployeeService['update']>[1],
    );

    expect(repo.update).toHaveBeenCalledWith('e1', patch);
    expect(result).toBe(updated);
  });

  it('maps Prisma P2025 (record not found) to NotFoundError', async () => {
    const p2025 = Object.assign(new Error('Record to update not found'), {
      code: 'P2025',
    });
    const repo = {
      findMany: vi.fn(),
      count: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockRejectedValue(p2025),
    };
    const service = new EmployeeService(
      repo as unknown as ConstructorParameters<typeof EmployeeService>[0],
    );

    await expect(
      service.update('missing', patch as Parameters<EmployeeService['update']>[1]),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('maps Prisma P2002 (duplicate) to ConflictError', async () => {
    const p2002 = Object.assign(new Error('Unique constraint failed'), {
      code: 'P2002',
    });
    const repo = {
      findMany: vi.fn(),
      count: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockRejectedValue(p2002),
    };
    const service = new EmployeeService(
      repo as unknown as ConstructorParameters<typeof EmployeeService>[0],
    );

    await expect(
      service.update('e1', patch as Parameters<EmployeeService['update']>[1]),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

describe('EmployeeService.delete', () => {
  it('calls repo.delete with the id', async () => {
    const repo = {
      findMany: vi.fn(),
      count: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    const service = new EmployeeService(
      repo as unknown as ConstructorParameters<typeof EmployeeService>[0],
    );

    await service.delete('e1');

    expect(repo.delete).toHaveBeenCalledWith('e1');
  });

  it('maps Prisma P2025 (record not found) to NotFoundError', async () => {
    const p2025 = Object.assign(new Error('Record to delete does not exist'), {
      code: 'P2025',
    });
    const repo = {
      findMany: vi.fn(),
      count: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockRejectedValue(p2025),
    };
    const service = new EmployeeService(
      repo as unknown as ConstructorParameters<typeof EmployeeService>[0],
    );

    await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('EmployeeService.list — filtering, search, sorting', () => {
  function makeRepo() {
    return {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
  }

  function makeService(repo: ReturnType<typeof makeRepo>) {
    return new EmployeeService(
      repo as unknown as ConstructorParameters<typeof EmployeeService>[0],
    );
  }

  const searchOr = [
    { firstName: { contains: 'ali', mode: 'insensitive' } },
    { lastName: { contains: 'ali', mode: 'insensitive' } },
    { email: { contains: 'ali', mode: 'insensitive' } },
  ];

  it('1. search builds a case-insensitive OR across firstName, lastName, email', async () => {
    const repo = makeRepo();

    await makeService(repo).list({ page: 1, pageSize: 20, search: 'ali' });

    expect(repo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { OR: searchOr } }),
    );
    expect(repo.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: { OR: searchOr } }),
    );
  });

  it('2. department & country become equality filters, ANDed with search', async () => {
    const repo = makeRepo();

    await makeService(repo).list({
      page: 1,
      pageSize: 20,
      search: 'ali',
      department: 'Engineering',
      country: 'IN',
    });

    expect(repo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { department: 'Engineering', country: 'IN', OR: searchOr },
      }),
    );
  });

  it('3a. sort="baseSalaryCents:desc" produces orderBy { baseSalaryCents: "desc" }', async () => {
    const repo = makeRepo();

    await makeService(repo).list({
      page: 1,
      pageSize: 20,
      sort: 'baseSalaryCents:desc',
    });

    expect(repo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { baseSalaryCents: 'desc' } }),
    );
  });

  it('3b. no sort defaults to orderBy { lastName: "asc" }', async () => {
    const repo = makeRepo();

    await makeService(repo).list({ page: 1, pageSize: 20 });

    expect(repo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { lastName: 'asc' } }),
    );
  });

  it('4. an unknown/disallowed sort field throws ValidationError and never queries', async () => {
    const repo = makeRepo();

    await expect(
      makeService(repo).list({ page: 1, pageSize: 20, sort: 'salary:desc' }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(repo.findMany).not.toHaveBeenCalled();
  });

  it('5. pagination still applies on top of filter/search/sort', async () => {
    const repo = makeRepo();

    await makeService(repo).list({
      page: 3,
      pageSize: 25,
      search: 'ali',
      department: 'Engineering',
      sort: 'hireDate:asc',
    });

    expect(repo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 50,
        take: 25,
        orderBy: { hireDate: 'asc' },
      }),
    );
  });
});
