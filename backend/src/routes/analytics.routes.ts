import { Router } from 'express';
import { makeAnalyticsController, type AnalyticsServicePort } from '../controllers/analytics.controller.js';

export function createAnalyticsRouter(service: AnalyticsServicePort): Router {
  const controller = makeAnalyticsController(service);
  const router = Router();
  router.get('/summary', controller.getSummary);
  router.get('/by-department', controller.getByDepartment);
  router.get('/by-country', controller.getByCountry);
  return router;
}
