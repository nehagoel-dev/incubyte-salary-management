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

export interface CountryStat {
  country: string;
  headcount: number;
  totalPayrollUsdCents: number;
  averageSalaryUsdCents: number;
  medianSalaryUsdCents: number;
}

export interface DepartmentStat {
  department: string;
  headcount: number;
  totalPayrollUsdCents: number;
  averageSalaryUsdCents: number;
  medianSalaryUsdCents: number;
}

export class AnalyticsService {
  constructor(private readonly repo: AnalyticsRepositoryPort) {}

  private calcMedian(sorted: number[]): number {
    const n = sorted.length;
    return n % 2 === 1
      ? sorted[Math.floor(n / 2)]
      : Math.round((sorted[n / 2 - 1] + sorted[n / 2]) / 2);
  }

  async getSummary(): Promise<SummaryResult> {
    const rows = await this.repo.findAllForAnalytics();
    const headcount = rows.length;
    if (headcount === 0) {
      return { headcount: 0, totalPayrollUsdCents: 0, averageSalaryUsdCents: 0, medianSalaryUsdCents: 0 };
    }
    const usdAmounts = rows.map(r => convertCents(r.baseSalaryCents, r.currency, 'USD'));
    const total = usdAmounts.reduce((sum, v) => sum + v, 0);
    const sorted = [...usdAmounts].sort((a, b) => a - b);
    return {
      headcount,
      totalPayrollUsdCents: total,
      averageSalaryUsdCents: Math.round(total / headcount),
      medianSalaryUsdCents: this.calcMedian(sorted),
    };
  }

  async getByDepartment(): Promise<DepartmentStat[]> {
    const rows = await this.repo.findAllForAnalytics();
    const groups = new Map<string, number[]>();
    for (const r of rows) {
      const usd = convertCents(r.baseSalaryCents, r.currency, 'USD');
      if (!groups.has(r.department)) groups.set(r.department, []);
      groups.get(r.department)!.push(usd);
    }
    return Array.from(groups.entries())
      .map(([department, amounts]) => {
        const headcount = amounts.length;
        const total = amounts.reduce((s, v) => s + v, 0);
        const sorted = [...amounts].sort((a, b) => a - b);
        return {
          department,
          headcount,
          totalPayrollUsdCents: total,
          averageSalaryUsdCents: Math.round(total / headcount),
          medianSalaryUsdCents: this.calcMedian(sorted),
        };
      })
      .sort((a, b) => a.department.localeCompare(b.department));
  }

  async getByCountry(): Promise<CountryStat[]> {
    const rows = await this.repo.findAllForAnalytics();
    const groups = new Map<string, number[]>();
    for (const r of rows) {
      const usd = convertCents(r.baseSalaryCents, r.currency, 'USD');
      if (!groups.has(r.country)) groups.set(r.country, []);
      groups.get(r.country)!.push(usd);
    }
    return Array.from(groups.entries())
      .map(([country, amounts]) => {
        const headcount = amounts.length;
        const total = amounts.reduce((s, v) => s + v, 0);
        const sorted = [...amounts].sort((a, b) => a - b);
        return {
          country,
          headcount,
          totalPayrollUsdCents: total,
          averageSalaryUsdCents: Math.round(total / headcount),
          medianSalaryUsdCents: this.calcMedian(sorted),
        };
      })
      .sort((a, b) => a.country.localeCompare(b.country));
  }
}
