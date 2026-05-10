export interface CommonResponseDTO<T> {
  error: false;
  message: 'OK';
  data: T;
}

export interface HealthCheckResponseDTO {
  name: string;
  version: string;
  stage: string;
}

export interface BaseExtrasDTO {
  total: number;
  limit?: number;
  skip?: number;
}

export interface PaginatedResponseDTO<T, U extends BaseExtrasDTO> {
  results: T;
  extras: U;
}

export interface IPaginationQuery {
  skip?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
  created_from?: string;
  created_to?: string;
  hide_deleted?: boolean;
  search_key?: string;
}
