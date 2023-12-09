import {
  AxisInstance,
  AxisRequestConfig,
  FetchMethod,
  ModifyMethod,
  RequestInterceptor,
  ResponseInterceptor,
} from './types';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  ResponseType,
} from 'axios';
import qs from 'qs';

export const createFetchRunner = (
  instance: AxiosInstance,
  method: FetchMethod,
  responseType: ResponseType,
) => {
  return function <T, R = AxiosResponse<T>>(
    url: string,
    params?: any,
    config?: AxisRequestConfig,
  ): Promise<R> {
    return instance[method](url, {
      params,
      responseType,
      ...config,
    });
  };
};

const createModifyRunner = (
  instance: AxiosInstance,
  method: ModifyMethod,
  contentType: 'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded',
) => {
  return function <T, R = AxiosResponse<T>>(
    url: string,
    params?: any,
    config?: AxisRequestConfig,
  ): Promise<R> {
    if (contentType === 'application/x-www-form-urlencoded') {
      params = qs.stringify(params);
    }

    if (contentType === 'multipart/form-data') {
      const formData = new FormData();
      Object.keys(params).forEach(key => formData.append(key, params[key]));
      params = formData;
    }

    return instance[method](url, params, {
      headers: {
        'Content-Type': contentType,
      },
      ...config,
    });
  };
};

export const createAxis = (config: AxiosRequestConfig): AxisInstance => {
  const instance = axios.create(config);

  const getHeaders = () => {
    return instance.defaults.headers.common;
  };

  const setHeader = (key: string, value: string | number | boolean) => {
    (instance.defaults.headers.common as AxiosRequestHeaders)[key] = value;
  };

  const removeHeader = (key: string | string[]) => {
    if (typeof key === 'string') {
      Reflect.deleteProperty(instance.defaults.headers.common as AxiosRequestHeaders, key);
      return;
    }

    key.forEach(k =>
      Reflect.deleteProperty(instance.defaults.headers.common as AxiosRequestHeaders, k),
    );
  };

  const useRequestInterceptor = (...interceptors: RequestInterceptor[]) => {
    interceptors.forEach(interceptor => {
      instance.interceptors.request.use(
        interceptor.onFulfilled,
        interceptor.onRejected,
        interceptor.options,
      );
    });
  };

  const useResponseInterceptor = (...interceptors: ResponseInterceptor[]) => {
    interceptors.forEach(interceptor => {
      instance.interceptors.response.use(
        interceptor.onFulfilled,
        interceptor.onRejected,
        interceptor.options,
      );
    });
  };

  return {
    get: createFetchRunner(instance, 'get', 'json'),
    getBlob: createFetchRunner(instance, 'get', 'blob'),
    getDocument: createFetchRunner(instance, 'get', 'document'),
    getArrayBuffer: createFetchRunner(instance, 'get', 'arraybuffer'),
    getText: createFetchRunner(instance, 'get', 'text'),
    getStream: createFetchRunner(instance, 'get', 'stream'),

    head: createFetchRunner(instance, 'head', 'json'),
    headBlob: createFetchRunner(instance, 'head', 'blob'),
    headDocument: createFetchRunner(instance, 'head', 'document'),
    headArrayBuffer: createFetchRunner(instance, 'head', 'arraybuffer'),
    headText: createFetchRunner(instance, 'head', 'text'),
    headStream: createFetchRunner(instance, 'head', 'stream'),

    options: createFetchRunner(instance, 'options', 'json'),
    optionsBlob: createFetchRunner(instance, 'options', 'blob'),
    optionsDocument: createFetchRunner(instance, 'options', 'document'),
    optionsArrayBuffer: createFetchRunner(instance, 'options', 'arraybuffer'),
    optionsText: createFetchRunner(instance, 'options', 'text'),
    optionsStream: createFetchRunner(instance, 'options', 'stream'),

    delete: createFetchRunner(instance, 'delete', 'json'),
    deleteBlob: createFetchRunner(instance, 'delete', 'blob'),
    deleteDocument: createFetchRunner(instance, 'delete', 'document'),
    deleteArrayBuffer: createFetchRunner(instance, 'delete', 'arraybuffer'),
    deleteText: createFetchRunner(instance, 'delete', 'text'),
    deleteStream: createFetchRunner(instance, 'delete', 'stream'),

    post: createModifyRunner(instance, 'post', 'application/json'),
    postUrlEncode: createModifyRunner(instance, 'post', 'application/x-www-form-urlencoded'),
    postMultipart: createModifyRunner(instance, 'post', 'multipart/form-data'),

    put: createModifyRunner(instance, 'put', 'application/json'),
    putUrlEncode: createModifyRunner(instance, 'put', 'application/x-www-form-urlencoded'),
    putMultipart: createModifyRunner(instance, 'put', 'multipart/form-data'),

    patch: createModifyRunner(instance, 'patch', 'application/json'),
    patchUrlEncode: createModifyRunner(instance, 'patch', 'application/x-www-form-urlencoded'),
    patchMultipart: createModifyRunner(instance, 'patch', 'multipart/form-data'),

    getHeaders,
    setHeader,
    removeHeader,

    useRequestInterceptor,
    useResponseInterceptor,

    axios: instance,
  };
};
