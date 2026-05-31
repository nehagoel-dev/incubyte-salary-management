import { convertCents } from '../lib/currency.js';
import type { AnalyticsRow } from '../repositories/analytics.repository.js';

export interface AnalyticsRepositoryPort {
  findAllForAnalytics(): Promise<AnalyticsRow[]>;
}

export interface SummaryResult {
  headcount: number;
  totalPayrollUsdCents: number;
  averageSalaryUsdCents: number;
  medianSalaryUsdCents: number;
}

export class AnalyticsService {
  constructor(private readonly repo: AnalyticsRepositoryPort) {}

  async getSummary(): Promise<SummaryResult> {
    const rows = await this.repo.findAllForAnalytics();
    const headcount = rows.length;
    if (headcount === 0) {
      return { headcount: 0, totalPayrollUsdCents: 0, averageSalaryUsdCents: 0, medianSalaryUsdCents: 0 };
    }
    const usdAmounts = rows.map(r => convertCents(r.baseSalaryCents, r.currency, 'USD'));
    const total = usdAmounts.reduce((sum, v) => sum + v, 0);
    const average = Math.round(total / headcount);
    const sorted = [...usdAmounts].sort((a, b) => a - b);
    const median = headcount % 2 === 1
      ? sorted[Math.floor(headcount / 2)]
      : Math.round((sorted[headcount / 2 - 1] + sorted[headcount / 2]) / 2);
    return { headcount, totalPayrollUsdCents: total, averageSalaryUsdCents: average, medianSalaryUsdCents: median };
  }
}
