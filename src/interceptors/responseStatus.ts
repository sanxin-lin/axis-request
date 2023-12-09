import type { ResponseInterceptor, ResponseStatusInterceptorOptions } from '../types';
import { createMatcher } from '../utils';

export const responseStatusInterceptor = (
  options: ResponseStatusInterceptorOptions,
): ResponseInterceptor => {
  return {
    onFulfilled: response => {
      const matcher = createMatcher(options.include, options.exclude);
      if (!matcher(response.config.method ?? '', response.config.url ?? '')) {
        return response;
      }

      const handler = (options.validStatusHandler ?? {})[response.status];
      if (!handler) {
        return response;
      }

      const handlerResponse = handler(response);

      return handlerResponse ?? response;
    },

    onRejected: error => {
      const matcher = createMatcher(options.include, options.exclude);
      if (!matcher(error.config.method ?? '', error.config.url ?? '')) {
        return Promise.reject(error);
      }

      const handler = (options.invalidStatusHandler ?? {})[error.response.status];
      if (!handler) {
        return Promise.reject(error);
      }

      const handlerError = handler(error);
      return handlerError ?? Promise.reject(error);
    },
    options: options.axiosInterceptorOptions,
  };
};
