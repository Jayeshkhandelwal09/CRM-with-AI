import { useState, useEffect, useCallback, useRef } from 'react';

export interface QueryOptions<T> {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  retry?: number | boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleTime: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, staleTime: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      staleTime,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isStale = Date.now() - entry.timestamp > entry.staleTime;
    if (isStale) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

const queryCache = new QueryCache();

export function useQuery<T>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options: QueryOptions<T> = {}
): QueryResult<T> {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus = true,
    refetchInterval,
    retry = 3,
    onSuccess,
    onError,
  } = options;

  const key = Array.isArray(queryKey) ? queryKey.join('-') : queryKey;
  
  const [data, setData] = useState<T | undefined>(() => {
    return queryCache.get<T>(key) || undefined;
  });
  const [isLoading, setIsLoading] = useState(!data && enabled);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  
  const retryCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!enabled) return;

    // Check cache first (unless it's a refetch)
    if (!isRefetch) {
      const cachedData = queryCache.get<T>(key);
      if (cachedData) {
        setData(cachedData);
        setIsLoading(false);
        setIsError(false);
        setError(null);
        return;
      }
    }

    setIsFetching(true);
    if (!data) setIsLoading(true);

    try {
      const result = await queryFn();
      setData(result);
      setIsError(false);
      setError(null);
      retryCountRef.current = 0;
      
      // Cache the result
      queryCache.set(key, result, staleTime);
      
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      
      if (retry && retryCountRef.current < (typeof retry === 'number' ? retry : 3)) {
        retryCountRef.current++;
        setTimeout(() => fetchData(isRefetch), 1000 * retryCountRef.current);
        return;
      }
      
      setIsError(true);
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [enabled, key, queryFn, staleTime, retry, onSuccess, onError, data]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  const invalidate = useCallback(() => {
    queryCache.invalidate(key);
    setData(undefined);
  }, [key]);

  // Initial fetch
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, enabled, fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (refetchOnWindowFocus && enabled) {
      const handleFocus = () => fetchData(true);
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [refetchOnWindowFocus, enabled, fetchData]);

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess: !isLoading && !isError && data !== undefined,
    isFetching,
    refetch,
    invalidate,
  };
}

export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
  } = {}
) {
  const [data, setData] = useState<TData | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);
      options.onSuccess?.(result, variables);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setIsError(true);
      setError(error);
      options.onError?.(error, variables);
      throw error;
    } finally {
      setIsLoading(false);
      options.onSettled?.(data, error, variables);
    }
  }, [mutationFn, options, data, error]);

  const reset = useCallback(() => {
    setData(undefined);
    setIsError(false);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess: !isLoading && !isError && data !== undefined,
    mutate,
    reset,
  };
}

// Global cache management
export const queryClient = {
  invalidateQueries: (queryKey: string | string[]) => {
    const key = Array.isArray(queryKey) ? queryKey.join('-') : queryKey;
    queryCache.invalidate(key);
  },
  clear: () => queryCache.clear(),
}; 