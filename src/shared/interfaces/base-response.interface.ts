export interface IBaseResponse<T = any> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      lastPage: number;
    };
  };
}
