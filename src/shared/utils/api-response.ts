import { v4 as uuidv4 } from 'uuid';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    requestId: string;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export class ApiResponse {
  static success<T>(data: T, requestId?: string | string[]): SuccessResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (Array.isArray(requestId) ? requestId[0] : requestId) || uuidv4(),
      },
    };
  }

  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    requestId?: string | string[]
  ): SuccessResponse<T[]> {
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      data: items,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
        timestamp: new Date().toISOString(),
        requestId: (Array.isArray(requestId) ? requestId[0] : requestId) || uuidv4(),
      },
    };
  }

  static error(
    code: string,
    message: string,
    details?: Record<string, string[]>,
    requestId?: string | string[]
  ): ErrorResponse {
    return {
      success: false,
      error: { code, message, details },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (Array.isArray(requestId) ? requestId[0] : requestId) || uuidv4(),
      },
    };
  }
}
