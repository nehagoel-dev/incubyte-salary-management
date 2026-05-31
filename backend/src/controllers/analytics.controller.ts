import { asyncHandler } from '../lib/async-handler.js';

export interface AnalyticsServicePort {
  getSummary(): Promise<unknown>;
  getByDepartment(): Promise<unknown>;
}

export function makeAnalyticsController(service: AnalyticsServicePort) {
  const getSummary = asyncHandler(async (_req, res) => {
    res.json(await service.getSummary());
  });
  const getByDepartment = asyncHandler(async (_req, res) => {
    res.json(await service.getByDepartment());
  });
  return { getSummary, getByDepartment };
}
