import { prisma } from '../lib/prisma.js';

export type AnalyticsRow = {
  baseSalaryCents: number;
  currency: string;
  department: string;
  country: string;
};

export class AnalyticsRepository {
  findAllForAnalytics(): Promise<AnalyticsRow[]> {
    return prisma.employee.findMany({
      select: { baseSalaryCents: true, currency: true, department: true, country: true },
    });
  }
}
