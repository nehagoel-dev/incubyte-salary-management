import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AnalyticsService } from './analytics.service.js';

const findAllForAnalytics = vi.fn();
const makeRepo = () => ({ findAllForAnalytics });

describe('AnalyticsService.getSummary', () => {
  beforeEach(() => { findAllForAnalytics.mockReset(); });

  it('Dataset C: empty dataset returns all zeros', async () => {
    findAllForAnalytics.mockResolvedValue([]);
    const service = new AnalyticsService(makeRepo());
    expect(await service.getSummary()).toEqual({
      headcount: 0,
      totalPayrollUsdCents: 0,
      averageSalaryUsdCents: 0,
      medianSalaryUsdCents: 0,
    });
  });

  it('Dataset A: even count mixed currencies', async () => {
    findAllForAnalytics.mockResolvedValue([
      { baseSalaryCents: 50000, currency: 'USD', department: 'Eng', country: 'US' },
      { baseSalaryCents: 100000, currency: 'EUR', department: 'HR', country: 'DE' },
      { baseSalaryCents: 800000, currency: 'INR', department: 'Ops', country: 'IN' },
      { baseSalaryCents: 60000, currency: 'USD', department: 'Eng', country: 'US' },
    ]);
    const service = new AnalyticsService(makeRepo());
    expect(await service.getSummary()).toEqual({
      headcount: 4,
      totalPayrollUsdCents: 228600,
      averageSalaryUsdCents: 57150,
      medianSalaryUsdCents: 55000,
    });
  });

  it('Dataset B: odd count same currency', async () => {
    findAllForAnalytics.mockResolvedValue([
      { baseSalaryCents: 30000, currency: 'USD', department: 'Eng', country: 'US' },
      { baseSalaryCents: 70000, currency: 'USD', department: 'HR', country: 'US' },
      { baseSalaryCents: 50000, currency: 'USD', department: 'Ops', country: 'US' },
    ]);
    const service = new AnalyticsService(makeRepo());
    expect(await service.getSummary()).toEqual({
      headcount: 3,
      totalPayrollUsdCents: 150000,
      averageSalaryUsdCents: 50000,
      medianSalaryUsdCents: 50000,
    });
  });

  it('single employee (USD, 80000 cents)', async () => {
    findAllForAnalytics.mockResolvedValue([
      { baseSalaryCents: 80000, currency: 'USD', department: 'Eng', country: 'US' },
    ]);
    const service = new AnalyticsService(makeRepo());
    expect(await service.getSummary()).toEqual({
      headcount: 1,
      totalPayrollUsdCents: 80000,
      averageSalaryUsdCents: 80000,
      medianSalaryUsdCents: 80000,
    });
  });
});

describe('AnalyticsService.getByDepartment', () => {
  beforeEach(() => { findAllForAnalytics.mockReset(); });

  it('empty dataset returns []', async () => {
    findAllForAnalytics.mockResolvedValue([]);
    const service = new AnalyticsService(makeRepo());
    expect(await service.getByDepartment()).toEqual([]);
  });

  it('Dataset A: 2 departments sorted alphabetically with correct stats', async () => {
    findAllForAnalytics.mockResolvedValue([
      { baseSalaryCents: 50000, currency: 'USD', department: 'Engineering', country: 'US' },
      { baseSalaryCents: 100000, currency: 'EUR', department: 'Engineering', country: 'DE' },
      { baseSalaryCents: 800000, currency: 'INR', department: 'Sales', country: 'IN' },
      { baseSalaryCents: 60000, currency: 'USD', department: 'Sales', country: 'US' },
    ]);
    const service = new AnalyticsService(makeRepo());
    expect(await service.getByDepartment()).toEqual([
      { department: 'Engineering', headcount: 2, totalPayrollUsdCents: 159000, averageSalaryUsdCents: 79500, medianSalaryUsdCents: 79500 },
      { department: 'Sales', headcount: 2, totalPayrollUsdCents: 69600, averageSalaryUsdCents: 34800, medianSalaryUsdCents: 34800 },
    ]);
  });

  it('odd-count median per department', async () => {
    findAllForAnalytics.mockResolvedValue([
      { baseSalaryCents: 50000, currency: 'USD', department: 'Engineering', country: 'US' },
      { baseSalaryCents: 100000, currency: 'EUR', department: 'Engineering', country: 'DE' },
      { baseSalaryCents: 90000, currency: 'USD', department: 'Engineering', country: 'US' },
      { baseSalaryCents: 800000, currency: 'INR', department: 'Sales', country: 'IN' },
      { baseSalaryCents: 60000, currency: 'USD', department: 'Sales', country: 'US' },
    ]);
    const service = new AnalyticsService(makeRepo());
    const result = await service.getByDepartment();
    const eng = result.find(d => d.department === 'Engineering');
    expect(eng?.medianSalaryUsdCents).toBe(90000);
  });

  it('single department, single employee', async () => {
    findAllForAnalytics.mockResolvedValue([
      { baseSalaryCents: 70000, currency: 'USD', department: 'Finance', country: 'US' },
    ]);
    const service = new AnalyticsService(makeRepo());
    expect(await service.getByDepartment()).toEqual([
      { department: 'Finance', headcount: 1, totalPayrollUsdCents: 70000, averageSalaryUsdCents: 70000, medianSalaryUsdCents: 70000 },
    ]);
  });
});

describe('AnalyticsService.getByCountry', () => {
  beforeEach(() => { findAllForAnalytics.mockReset(); });

  it('empty dataset returns []', async () => {
    findAllForAnalytics.mockResolvedValue([]);
    const service = new AnalyticsService(makeRepo());
    expect(await service.getByCountry()).toEqual([]);
  });

  it('Dataset A: 3 countries sorted alphabetically with correct stats', async () => {
    findAllForAnalytics.mockResolvedValue([
      { baseSalaryCents: 50000, currency: 'USD', department: 'Engineering', country: 'US' },
      { baseSalaryCents: 100000, currency: 'EUR', department: 'Engineering', country: 'DE' },
      { baseSalaryCents: 800000, currency: 'INR', department: 'Sales', country: 'IN' },
      { baseSalaryCents: 60000, currency: 'USD', department: 'Sales', country: 'US' },
    ]);
    const service = new AnalyticsService(makeRepo());
    expect(await service.getByCountry()).toEqual([
      { country: 'DE', headcount: 1, totalPayrollUsdCents: 109000, averageSalaryUsdCents: 109000, medianSalaryUsdCents: 109000 },
      { country: 'IN', headcount: 1, totalPayrollUsdCents: 9600, averageSalaryUsdCents: 9600, medianSalaryUsdCents: 9600 },
      { country: 'US', headcount: 2, totalPayrollUsdCents: 110000, averageSalaryUsdCents: 55000, medianSalaryUsdCents: 55000 },
    ]);
  });

  it('odd-count median per country', async () => {
    findAllForAnalytics.mockResolvedValue([
      { baseSalaryCents: 50000, currency: 'USD', department: 'Engineering', country: 'US' },
      { baseSalaryCents: 100000, currency: 'EUR', department: 'Engineering', country: 'DE' },
      { baseSalaryCents: 800000, currency: 'INR', department: 'Sales', country: 'IN' },
      { baseSalaryCents: 60000, currency: 'USD', department: 'Sales', country: 'US' },
      { baseSalaryCents: 40000, currency: 'USD', department: 'Sales', country: 'US' },
    ]);
    const service = new AnalyticsService(makeRepo());
    const result = await service.getByCountry();
    const us = result.find(c => c.country === 'US');
    expect(us?.medianSalaryUsdCents).toBe(50000);
  });

  it('all employees in one country', async () => {
    findAllForAnalytics.mockResolvedValue([
      { baseSalaryCents: 50000, currency: 'USD', department: 'Engineering', country: 'US' },
      { baseSalaryCents: 70000, currency: 'USD', department: 'Sales', country: 'US' },
    ]);
    const service = new AnalyticsService(makeRepo());
    expect(await service.getByCountry()).toEqual([
      { country: 'US', headcount: 2, totalPayrollUsdCents: 120000, averageSalaryUsdCents: 60000, medianSalaryUsdCents: 60000 },
    ]);
  });
});
