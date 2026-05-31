import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const { getSummaryMock, getByDepartmentMock, getByCountryMock } = vi.hoisted(() => ({
  getSummaryMock: vi.fn(),
  getByDepartmentMock: vi.fn(),
  getByCountryMock: vi.fn(),
}));

vi.mock('../services/analytics.service.js', () => ({
  AnalyticsService: vi.fn(() => ({
    getSummary: getSummaryMock,
    getByDepartment: getByDepartmentMock,
    getByCountry: getByCountryMock,
  })),
}));

import { createApp } from '../app.js';

beforeEach(() => { vi.clearAllMocks(); });

describe('GET /api/analytics/summary', () => {
  it('5. returns 200 with the summary shape from the service', async () => {
    getSummaryMock.mockResolvedValue({
      headcount: 4,
      totalPayrollUsdCents: 228600,
      averageSalaryUsdCents: 57150,
      medianSalaryUsdCents: 55000,
    });

    const res = await request(createApp()).get('/api/analytics/summary');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      headcount: expect.any(Number),
      totalPayrollUsdCents: expect.any(Number),
      averageSalaryUsdCents: expect.any(Number),
      medianSalaryUsdCents: expect.any(Number),
    });
  });

  it('6. service throws unexpected error → 500 with safe JSON body', async () => {
    getSummaryMock.mockRejectedValueOnce(new Error('db exploded: SECRET'));

    const res = await request(createApp()).get('/api/analytics/summary');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body).not.toHaveProperty('stack');
    expect(JSON.stringify(res.body)).not.toContain('SECRET');
  });
});

describe('GET /api/analytics/by-department', () => {
  it('5. returns 200 with the department array from the service', async () => {
    getByDepartmentMock.mockResolvedValue([
      { department: 'Engineering', headcount: 2, totalPayrollUsdCents: 159000, averageSalaryUsdCents: 79500, medianSalaryUsdCents: 79500 },
      { department: 'Sales', headcount: 2, totalPayrollUsdCents: 69600, averageSalaryUsdCents: 34800, medianSalaryUsdCents: 34800 },
    ]);

    const res = await request(createApp()).get('/api/analytics/by-department');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ department: expect.any(String), headcount: expect.any(Number) }),
    ]));
  });

  it('6. service throws unexpected error → 500 with safe JSON body', async () => {
    getByDepartmentMock.mockRejectedValueOnce(new Error('db exploded: SECRET2'));

    const res = await request(createApp()).get('/api/analytics/by-department');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body).not.toHaveProperty('stack');
    expect(JSON.stringify(res.body)).not.toContain('SECRET2');
  });
});

describe('GET /api/analytics/by-country', () => {
  it('5. returns 200 with the country array from the service', async () => {
    getByCountryMock.mockResolvedValue([
      { country: 'DE', headcount: 1, totalPayrollUsdCents: 109000, averageSalaryUsdCents: 109000, medianSalaryUsdCents: 109000 },
      { country: 'US', headcount: 2, totalPayrollUsdCents: 110000, averageSalaryUsdCents: 55000, medianSalaryUsdCents: 55000 },
    ]);

    const res = await request(createApp()).get('/api/analytics/by-country');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ country: expect.any(String), headcount: expect.any(Number) }),
    ]));
  });

  it('6. service throws unexpected error → 500 with safe JSON body', async () => {
    getByCountryMock.mockRejectedValueOnce(new Error('db exploded: SECRET3'));

    const res = await request(createApp()).get('/api/analytics/by-country');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body).not.toHaveProperty('stack');
    expect(JSON.stringify(res.body)).not.toContain('SECRET3');
  });
});
