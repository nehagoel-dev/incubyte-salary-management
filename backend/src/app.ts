import express, { type Express } from 'express';
import cors, { type CorsOptions } from 'cors';
import { EmployeeService } from './services/employee.service.js';
import { EmployeeRepository } from './repositories/employee.repository.js';
import { createEmployeeRouter } from './routes/employee.routes.js';
import { AnalyticsService } from './services/analytics.service.js';
import { AnalyticsRepository } from './repositories/analytics.repository.js';
import { createAnalyticsRouter } from './routes/analytics.routes.js';
import { errorHandler } from './middleware/error-handler.js';

const corsOptions: CorsOptions = {
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export function createApp(): Express {
  const app = express();
  app.use(cors(corsOptions));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const employeeService = new EmployeeService(new EmployeeRepository());
  app.use('/api', createEmployeeRouter(employeeService));

  const analyticsService = new AnalyticsService(new AnalyticsRepository());
  app.use('/api/analytics', createAnalyticsRouter(analyticsService));

  app.use(errorHandler);

  return app;
}

export const app = createApp();
