export abstract class BaseException extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export class BadRequestException extends BaseException {
  readonly statusCode = 400;
  readonly code = 'BAD_REQUEST';
}

export class UnauthorizedException extends BaseException {
  readonly statusCode = 401;
  readonly code = 'UNAUTHORIZED';
}

export class ForbiddenException extends BaseException {
  readonly statusCode = 403;
  readonly code = 'FORBIDDEN';
}

export class NotFoundException extends BaseException {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';
}

export class ConflictException extends BaseException {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';
}

export class ValidationException extends BaseException {
  readonly statusCode = 422;
  readonly code = 'VALIDATION_ERROR';
}

export class RateLimitException extends BaseException {
  readonly statusCode = 429;
  readonly code = 'RATE_LIMIT_EXCEEDED';
}

export class InternalServerException extends BaseException {
  readonly statusCode = 500;
  readonly code = 'INTERNAL_ERROR';
}
