import { describe, it, expect, vi } from 'vitest';
import { EmployeeService } from './employee.service.js';
import { NotFoundError } from '../lib/errors.js';

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

    expect(repo.findMany).toHaveBeenCalledWith({ skip: 10, take: 10 });
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
