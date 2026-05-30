import express, { type Express } from 'express';
import { EmployeeService } from './services/employee.service.js';
import { EmployeeRepository } from './repositories/employee.repository.js';
import { createEmployeeRouter } from './routes/employee.routes.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const employeeService = new EmployeeService(new EmployeeRepository());
  app.use('/api', createEmployeeRouter(employeeService));

  app.use(errorHandler);

  return app;
}

export const app = createApp();
