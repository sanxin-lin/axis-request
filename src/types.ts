import type {
  AxiosInstance,
  AxiosInterceptorOptions,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  InternalAxiosRequestConfig,
} from 'axios';

export type AxisRequestConfig = AxiosRequestConfig & {
  exceptionMessage?: string;
};

export type FetchRunner = <T = any, R = AxiosResponse<T>>(
  url: string,
  params?: any,
  config?: AxisRequestConfig,
) => Promise<R>;

export type FetchMethod = 'get' | 'delete' | 'options' | 'head';

export type ModifyMethod = 'post' | 'put' | 'patch';

export interface Interceptor<V> {
  onFulfilled?: ((value: V) => any) | null;
  onRejected?: ((error: any) => any) | null;
  options?: AxiosInterceptorOptions;
}

export type RequestInterceptor = Interceptor<InternalAxiosRequestConfig>;

export type ResponseInterceptor<V = AxiosResponse<any, any>> = Interceptor<V>;

export type RunnerMethod = keyof Omit<
  AxisInstance,
  | 'axios'
  | 'getHeaders'
  | 'setHeader'
  | 'removeHeader'
  | 'useRequestInterceptor'
  | 'useResponseInterceptor'
>;

export type AxisInstance = {
  get: FetchRunner;
  getBlob: FetchRunner;
  getDocument: FetchRunner;
  getText: FetchRunner;
  getArrayBuffer: FetchRunner;
  getStream: FetchRunner;

  head: FetchRunner;
  headBlob: FetchRunner;
  headDocument: FetchRunner;
  headText: FetchRunner;
  headArrayBuffer: FetchRunner;
  headStream: FetchRunner;

  options: FetchRunner;
  optionsBlob: FetchRunner;
  optionsDocument: FetchRunner;
  optionsText: FetchRunner;
  optionsArrayBuffer: FetchRunner;
  optionsStream: FetchRunner;

  delete: FetchRunner;
  deleteBlob: FetchRunner;
  deleteDocument: FetchRunner;
  deleteText: FetchRunner;
  deleteArrayBuffer: FetchRunner;
  deleteStream: FetchRunner;

  post: FetchRunner;
  postUrlEncode: FetchRunner;
  postMultipart: FetchRunner;

  put: FetchRunner;
  putUrlEncode: FetchRunner;
  putMultipart: FetchRunner;

  patch: FetchRunner;
  patchUrlEncode: FetchRunner;
  patchMultipart: FetchRunner;

  getHeaders(): HeadersDefaults['common'];
  setHeader(key: string, value: string): void;
  removeHeader(key: string | string[]): void;

  useRequestInterceptor(...interceptors: RequestInterceptor[]): void;
  useResponseInterceptor(...interceptors: ResponseInterceptor[]): void;

  axios: AxiosInstance;
};

export interface BaseInterceptorOptions {
  include?: string[];
  exclude?: string[];
  axiosInterceptorOptions?: AxiosInterceptorOptions;
}

export interface RequestHeadersInterceptorOptions extends BaseInterceptorOptions {
  headers?: Record<string, string> | (() => Record<string, string>);
}

export interface ResponseBlobInterceptorOptions extends BaseInterceptorOptions {
  onResponse?: (response: AxiosResponse<any, any>) => any;
}

export interface ResponseRetryInterceptorOptions extends BaseInterceptorOptions {
  count?: number;
}

export interface ResponseStatusInterceptorOptions extends BaseInterceptorOptions {
  validStatusHandler?: Record<number | string, (response: AxiosResponse<any, any>) => any>;
  invalidStatusHandler?: Record<number | string, (error: any) => any>;
}

export interface ResponseTimeoutInterceptorOptions extends BaseInterceptorOptions {
  normalizeErrorCode?: string;
}
