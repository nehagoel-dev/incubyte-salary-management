import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { NotFoundError, ConflictError } from '../lib/errors.js';

// Mock the service module so no real repository/DB is ever touched.
// `vi.hoisted` lets the shared mocks be referenced inside the hoisted vi.mock factory.
const { listMock, getByIdMock, createMock, updateMock, deleteMock } = vi.hoisted(
  () => ({
    listMock: vi.fn(),
    getByIdMock: vi.fn(),
    createMock: vi.fn(),
    updateMock: vi.fn(),
    deleteMock: vi.fn(),
  }),
);

vi.mock('../services/employee.service.js', () => ({
  EmployeeService: vi.fn(() => ({
    list: listMock,
    getById: getByIdMock,
    create: createMock,
    update: updateMock,
    delete: deleteMock,
  })),
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

  it('6. forwards search to the service', async () => {
    await request(createApp()).get('/api/employees?search=ali');

    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ search: 'ali' }));
  });

  it('7. forwards department to the service', async () => {
    await request(createApp()).get('/api/employees?department=Engineering');

    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({ department: 'Engineering' }),
    );
  });

  it('8. forwards country to the service', async () => {
    await request(createApp()).get('/api/employees?country=IN');

    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ country: 'IN' }));
  });

  it('9. forwards sort to the service', async () => {
    await request(createApp()).get('/api/employees?sort=lastName:asc');

    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'lastName:asc' }),
    );
  });

  it('10. returns 400 and does NOT call the service for a disallowed sort value', async () => {
    const res = await request(createApp()).get('/api/employees?sort=lastName:up');

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

describe('GET /api/employees/:id', () => {
  it('returns 200 with the employee when found', async () => {
    const employee = { id: 'e1', firstName: 'Ada' };
    getByIdMock.mockResolvedValue(employee);

    const res = await request(createApp()).get('/api/employees/e1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(employee);
    expect(getByIdMock).toHaveBeenCalledWith('e1');
  });

  it('returns 404 with a JSON error body when the service throws NotFoundError', async () => {
    getByIdMock.mockRejectedValueOnce(new NotFoundError('Employee not found'));

    const res = await request(createApp()).get('/api/employees/missing');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/employees', () => {
  const validBody = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    department: 'Engineering',
    jobTitle: 'Engineer',
    country: 'GB',
    currency: 'GBP',
    baseSalaryCents: 5_000_000,
    employmentType: 'FULL_TIME',
    hireDate: '2020-01-15',
  };

  it('returns 201 with the created employee for a valid body', async () => {
    const created = { id: 'e1', ...validBody };
    createMock.mockResolvedValue(created);

    const res = await request(createApp()).post('/api/employees').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it('returns 400 and does NOT call the service for an invalid email', async () => {
    const res = await request(createApp())
      .post('/api/employees')
      .send({ ...validBody, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain('email');
    expect(createMock).not.toHaveBeenCalled();
  });

  it('returns 400 when baseSalaryCents <= 0', async () => {
    const res = await request(createApp())
      .post('/api/employees')
      .send({ ...validBody, baseSalaryCents: 0 });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain('baseSalaryCents');
    expect(createMock).not.toHaveBeenCalled();
  });

  it('returns 400 for a wrong-length country code', async () => {
    const res = await request(createApp())
      .post('/api/employees')
      .send({ ...validBody, country: 'GBR' });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain('country');
    expect(createMock).not.toHaveBeenCalled();
  });

  it('returns 400 for a wrong-length currency code', async () => {
    const res = await request(createApp())
      .post('/api/employees')
      .send({ ...validBody, currency: 'GB' });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain('currency');
    expect(createMock).not.toHaveBeenCalled();
  });

  it('returns 400 when a required field is missing', async () => {
    const { firstName, ...withoutFirstName } = validBody;
    void firstName;
    const res = await request(createApp())
      .post('/api/employees')
      .send(withoutFirstName);

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain('firstName');
    expect(createMock).not.toHaveBeenCalled();
  });

  it('returns 409 when the service throws ConflictError (duplicate email)', async () => {
    createMock.mockRejectedValueOnce(new ConflictError('Email already exists'));

    const res = await request(createApp()).post('/api/employees').send(validBody);

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });
});

describe('PATCH /api/employees/:id', () => {
  it('returns 200 with the updated employee for a valid partial body', async () => {
    const updated = { id: 'e1', jobTitle: 'Senior Engineer' };
    updateMock.mockResolvedValue(updated);

    const res = await request(createApp())
      .patch('/api/employees/e1')
      .send({ jobTitle: 'Senior Engineer' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updated);
    expect(updateMock).toHaveBeenCalledWith('e1', { jobTitle: 'Senior Engineer' });
  });

  it('returns 404 when the service throws NotFoundError (unknown id)', async () => {
    updateMock.mockRejectedValueOnce(new NotFoundError('Employee not found'));

    const res = await request(createApp())
      .patch('/api/employees/missing')
      .send({ jobTitle: 'Senior Engineer' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for an invalid field value and does NOT call the service', async () => {
    const res = await request(createApp())
      .patch('/api/employees/e1')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain('email');
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('returns 400 for an empty body and does NOT call the service', async () => {
    const res = await request(createApp()).patch('/api/employees/e1').send({});

    expect(res.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('returns 409 when the service throws ConflictError (duplicate email)', async () => {
    updateMock.mockRejectedValueOnce(new ConflictError('Email already exists'));

    const res = await request(createApp())
      .patch('/api/employees/e1')
      .send({ email: 'taken@example.com' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });
});

describe('DELETE /api/employees/:id', () => {
  it('returns 204 with no body on success', async () => {
    deleteMock.mockResolvedValue(undefined);

    const res = await request(createApp()).delete('/api/employees/e1');

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(res.text).toBe('');
    expect(deleteMock).toHaveBeenCalledWith('e1');
  });

  it('returns 404 when the service throws NotFoundError (unknown id)', async () => {
    deleteMock.mockRejectedValueOnce(new NotFoundError('Employee not found'));

    const res = await request(createApp()).delete('/api/employees/missing');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
