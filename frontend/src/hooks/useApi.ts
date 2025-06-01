import React, { useState, useCallback } from 'react';
import { ApiResponse } from '@/types';
import { getErrorMessage } from '@/lib/utils';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFunction(...args);
        
        if (response.success && response.data) {
          setState({
            data: response.data,
            loading: false,
            error: null,
          });
          return response.data;
        } else {
          const errorMessage = response.error || 'An error occurred';
          setState({
            data: null,
            loading: false,
            error: errorMessage,
          });
          return null;
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for API calls that should execute immediately
export function useApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  dependencies: any[] = []
): UseApiReturn<T> {
  const api = useApi(apiFunction);

  React.useEffect(() => {
    api.execute();
  }, dependencies);

  return api;
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<T = any, P = any>(
  mutationFunction: (params: P) => Promise<ApiResponse<T>>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (params: P): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await mutationFunction(params);
        
        if (response.success && response.data) {
          setState({
            data: response.data,
            loading: false,
            error: null,
          });
          return response.data;
        } else {
          const errorMessage = response.error || 'An error occurred';
          setState({
            data: null,
            loading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
        throw error;
      }
    },
    [mutationFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
} 