/**
 * Typed application errors. Services throw these; the central error handler
 * maps each to an HTTP status. Keeps controllers and services free of HTTP concerns.
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {}
export class NotFoundError extends AppError {}
export class ConflictError extends AppError {}
