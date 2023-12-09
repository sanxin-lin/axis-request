import { type Ref, ref } from 'vue';

import type { AxisInstance, AxisRequestConfig, RunnerMethod } from '../types';
import { isFunction } from '../utils';

// export interface RunOptions<P> {
//   params?: P;
//   config?: AxisRequestConfig;
//   resetValue?: boolean;
// }

export type Run<R, P> = (params: P, reset?: boolean) => Promise<R>;

export interface UseAxisRefs<V> {
  value: Ref<V>;
  loading: Ref<boolean>;
  error: Ref<Error | undefined>;
  uploadProgress: Ref<number>;
  downloadProgress: Ref<number>;
}

export interface UseAxisOptions<R = any, V = R, P = Record<string, any>> {
  url?: string;
  method?: RunnerMethod;
  value?: V;
  params?: P | (() => P);
  request: (params: P) => Promise<R>;
  resetValue?: boolean;
  config?: AxisRequestConfig;
  immediate?: boolean;
  onBefore?(refs: UseAxisRefs<V>): void;
  onAfter?(refs: UseAxisRefs<V>): void;
  onTransform?(response: R, refs: UseAxisRefs<V>): V;
  onSuccess?(response: R, refs: UseAxisRefs<V>): void;
  onError?(error: Error, refs: UseAxisRefs<V>): void;
}

export type UseAxisInstance<R, V, P> = [
  value: Ref<V>,
  run: Run<R, P>,
  extra: {
    uploadProgress: Ref<number>;
    downloadProgress: Ref<number>;
    loading: Ref<boolean>;
    error: Ref<Error | undefined>;
    abort(): void;
  },
];

export interface CreateUseAxisOptions {
  axis: AxisInstance;
  immediate?: boolean;
  onTransform?(response: any, refs: any): any;
}

export const createUseAxis = (options: CreateUseAxisOptions) => {
  const { axis, onTransform: defaultOnTransform, immediate: defaultImmediate } = options;

  const useAxis = <R = any, V = R, P = Record<string, any>>(
    options: UseAxisOptions<R, V, P>,
  ): UseAxisInstance<R, V, P> => {
    const {
      url = '',
      method = 'get',
      request,
      immediate = defaultImmediate,
      value: initialValue,
      resetValue: initialResetValue,
      params: initialParamsOrGetter,
      // config,
      onBefore = () => {},
      onAfter = () => {},
      onTransform = (defaultOnTransform as UseAxisOptions<R, V, P>['onTransform']) ??
        (response => response as unknown as V),
      onSuccess = () => {},
      onError = () => {},
    } = options;

    const value = ref(initialValue) as Ref<V>;
    const loading = ref(false);
    const error = ref<Error>();
    const downloadProgress = ref(0);
    const uploadProgress = ref(0);

    const refs: UseAxisRefs<V> = {
      value,
      loading,
      error,
      downloadProgress,
      uploadProgress,
    };

    let controller = new AbortController();

    const run: Run<R, P> = async (params, reset) => {
      if (controller.signal.aborted) {
        controller = new AbortController();
      }

      const resetValue = initialResetValue ?? reset;
      if (resetValue === true) {
        value.value = initialValue as V;
      }

      uploadProgress.value = 0;
      downloadProgress.value = 0;

      onBefore(refs);

      loading.value = true;

      try {
        const getterParams = isFunction(initialParamsOrGetter) ? initialParamsOrGetter() : {};
        const response = isFunction(request)
          ? await request(params)
          : await axis[method](
              url,
              { ...getterParams, ...options.params },
              {
                signal: controller.signal,

                onUploadProgress(event) {
                  uploadProgress.value = event.progress ?? 0;
                },

                onDownloadProgress(event) {
                  downloadProgress.value = event.progress ?? 0;
                },

                ...options.config,
              },
            );

        value.value = onTransform(response as R, refs);
        error.value = undefined;
        onSuccess(response as R, refs);
        loading.value = false;
        onAfter(refs);

        return response as R;
      } catch (responseError: any) {
        error.value = responseError as Error;
        onError(responseError as Error, refs);
        loading.value = false;
        onAfter(refs);

        throw responseError;
      }
    };

    const abort = () => {
      controller.abort();
    };

    if (immediate) {
      run(
        isFunction(initialParamsOrGetter) ? (initialParamsOrGetter() as P) : initialParamsOrGetter!,
      );
    }

    return [
      value,
      run,
      {
        loading,
        error,
        uploadProgress,
        downloadProgress,
        abort,
      },
    ];
  };

  return useAxis;
};
