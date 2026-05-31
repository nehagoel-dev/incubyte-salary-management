import { Router } from 'express';
import {
  makeEmployeeController,
  type EmployeeServicePort,
} from '../controllers/employee.controller.js';

export function createEmployeeRouter(service: EmployeeServicePort): Router {
  const controller = makeEmployeeController(service);
  const router = Router();
  router.get('/employees', controller.list);
  router.get('/employees/:id', controller.getById);
  router.post('/employees', controller.create);
  router.patch('/employees/:id', controller.update);
  router.delete('/employees/:id', controller.remove);
  return router;
}
