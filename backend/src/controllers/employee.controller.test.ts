import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock the service module so no real repository/DB is ever touched.
// `vi.hoisted` lets the shared mock be referenced inside the hoisted vi.mock factory.
const { listMock } = vi.hoisted(() => ({ listMock: vi.fn() }));

vi.mock('../services/employee.service.js', () => ({
  EmployeeService: vi.fn(() => ({ list: listMock })),
}));

import { createApp } from '../app.js';

const sample = { data: [{ id: '1' }], total: 1, page: 1, pageSize: 20 };

beforeEach(() => {
  vi.clearAllMocks();
  listMock.mockResolvedValue(sample);
});

describe('GET /api/employees', () => {
  it('1. returns 200 with a body shaped { data, total, page, pageSize }', async () => {
    const res = await request(createApp()).get('/api/employees');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(sample);
    expect(res.body).toMatchObject({
      data: expect.any(Array),
      total: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
    });
  });

  it('2. defaults to page=1, pageSize=20 when no query params are given', async () => {
    await request(createApp()).get('/api/employees');

    expect(listMock).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
  });

  it('3. parses page & pageSize and forwards numeric values to the service', async () => {
    await request(createApp()).get('/api/employees?page=2&pageSize=50');

    expect(listMock).toHaveBeenCalledWith({ page: 2, pageSize: 50 });
  });

  it('4. returns 400 and does NOT call the service for out-of-range params', async () => {
    const res = await request(createApp()).get('/api/employees?page=0&pageSize=-5');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(listMock).not.toHaveBeenCalled();
  });

  it('4b. returns 400 and does NOT call the service for non-numeric params', async () => {
    const res = await request(createApp()).get('/api/employees?page=abc');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(listMock).not.toHaveBeenCalled();
  });

  it('5. returns 500 with a safe error body (no stack leaked) when service throws', async () => {
    listMock.mockRejectedValueOnce(new Error('db exploded: SUPER_SECRET_STACK'));

    const res = await request(createApp()).get('/api/employees');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body).not.toHaveProperty('stack');
    expect(JSON.stringify(res.body)).not.toContain('SUPER_SECRET_STACK');
  });
});
