export type UUID = string;

export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface SoftDeleteFields {
  deletedAt?: Date | null;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

