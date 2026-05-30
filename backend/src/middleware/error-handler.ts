import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ValidationError, NotFoundError, ConflictError } from '../lib/errors.js';

/**
 * Central error handler. Maps typed/known errors to HTTP statuses and emits a
 * safe JSON body. Unknown errors become a generic 500 with no internals leaked.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'ValidationError', details: err.flatten() });
    return;
  }
  if (err instanceof ValidationError) {
    res.status(400).json({ error: 'ValidationError', message: err.message });
    return;
  }
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: 'NotFoundError', message: err.message });
    return;
  }
  if (err instanceof ConflictError) {
    res.status(409).json({ error: 'ConflictError', message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'InternalServerError' });
};
