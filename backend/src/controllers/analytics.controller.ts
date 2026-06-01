import { asyncHandler } from '../lib/async-handler.js';

export interface AnalyticsServicePort {
  getSummary(): Promise<unknown>;
  getByDepartment(): Promise<unknown>;
  getByCountry(): Promise<unknown>;
}

const ANALYTICS_CACHE = 'public, max-age=60, stale-while-revalidate=300';

export function makeAnalyticsController(service: AnalyticsServicePort) {
  const getSummary = asyncHandler(async (_req, res) => {
    res.set('Cache-Control', ANALYTICS_CACHE);
    res.json(await service.getSummary());
  });
  const getByDepartment = asyncHandler(async (_req, res) => {
    res.set('Cache-Control', ANALYTICS_CACHE);
    res.json(await service.getByDepartment());
  });
  const getByCountry = asyncHandler(async (_req, res) => {
    res.set('Cache-Control', ANALYTICS_CACHE);
    res.json(await service.getByCountry());
  });
  return { getSummary, getByDepartment, getByCountry };
}
