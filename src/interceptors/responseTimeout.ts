import type { ResponseInterceptor, ResponseTimeoutInterceptorOptions } from '../types';
import { createMatcher } from '../utils';

export const responseTimeoutInterceptor = (
  options: ResponseTimeoutInterceptorOptions = {},
): ResponseInterceptor => {
  return {
    onFulfilled: response => response,
    onRejected(error) {
      const matcher = createMatcher(options.include, options.exclude);
      if (!matcher(error.config.method ?? '', error.config.url ?? '')) {
        return Promise.reject(error);
      }

      if (
        (error.code === 'ECONNABORTED' && error.message.includes('timeout')) ||
        error.code === 'ETIMEDOUT'
      ) {
        error.code = options?.normalizeErrorCode ?? 'TIMEOUT';
      }

      return Promise.reject(error);
    },
    options: options.axiosInterceptorOptions,
  };
};
