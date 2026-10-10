export class AppError extends Error {
  constructor(message, code, status, fields) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.fields = fields;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.fields && { fields: this.fields }),
      },
    };
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', fields) {
    super(message, 'VALIDATION_ERROR', 400, fields);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 'CONFLICT', 409);
  }
}
