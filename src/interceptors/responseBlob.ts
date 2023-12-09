import type { ResponseBlobInterceptorOptions, ResponseInterceptor } from '../types';
import { createMatcher } from '../utils';

export const responseBlobInterceptor = (
  options: ResponseBlobInterceptorOptions = {},
): ResponseInterceptor => {
  return {
    onFulfilled(response) {
      const matcher = createMatcher(options.include, options.exclude);
      if (!matcher(response.config.method ?? '', response.config.url ?? '')) {
        return response;
      }

      if (response.request.responseType === 'blob') {
        return options.onResponse?.(response) ?? response;
      }

      return response;
    },
    onRejected: error => Promise.reject(error),
    options: options.axiosInterceptorOptions,
  };
};
