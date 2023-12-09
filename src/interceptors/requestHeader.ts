import type { RequestHeadersInterceptorOptions, RequestInterceptor } from '../types';
import { createMatcher, isFunction } from '../utils';

export const requestHeadersInterceptor = (
  options: RequestHeadersInterceptorOptions,
): RequestInterceptor => {
  const { headers: headersOrGetter } = options;

  return {
    onFulfilled: config => {
      const matcher = createMatcher(options.include, options.exclude);
      if (!matcher(config.method ?? '', config.url ?? '')) {
        return config;
      }

      const headers = (isFunction(headersOrGetter) ? headersOrGetter() : headersOrGetter) ?? {};

      Object.entries(headers).forEach(([key, value]) => {
        config.headers[key] = value;
      });

      return config;
    },
    onRejected: error => Promise.reject(error),
    options: options.axiosInterceptorOptions,
  };
};
