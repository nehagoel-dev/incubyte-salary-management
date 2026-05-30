import { Router } from 'express';
import {
  makeEmployeeController,
  type EmployeeListService,
} from '../controllers/employee.controller.js';

export function createEmployeeRouter(service: EmployeeListService): Router {
  const controller = makeEmployeeController(service);
  const router = Router();
  router.get('/employees', controller.list);
  router.get('/employees/:id', controller.getById);
  router.post('/employees', controller.create);
  return router;
}
