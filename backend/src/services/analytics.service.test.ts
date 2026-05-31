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
