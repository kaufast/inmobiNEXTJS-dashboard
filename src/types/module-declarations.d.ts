/**
 * Module declarations for external libraries
 */

// Declare missing module types
declare module 'react' {
  // Re-export ReactNode and useState
  export interface ReactNode { }
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  // Re-export the rest
  export * from 'react/index';
}

declare module 'react-dom' {
  export * from 'react-dom/index';
}

declare module '@tanstack/react-query' {
  export interface QueryClientConfig {}
  export interface QueryClientProviderProps {
    client: any;
    children?: React.ReactNode;
  }
  export function QueryClientProvider(props: QueryClientProviderProps): JSX.Element;
  export class QueryClient {
    constructor(config?: QueryClientConfig);
    invalidateQueries(options: any): Promise<void>;
    setQueryData(queryKey: any, data: any): void;
  }
  export interface UseQueryOptions<TData = unknown, TError = unknown> {
    queryKey?: any[];
    enabled?: boolean;
    queryFn?: () => Promise<TData>;
  }
  export interface UseQueryResult<TData = unknown, TError = unknown> {
    data?: TData;
    isLoading: boolean;
    error: TError | null;
  }
  export interface UseMutationOptions<TData = unknown, TError = unknown, TVariables = unknown> {
    mutationFn?: (variables: TVariables) => Promise<TData>;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
  }
  export interface UseMutationResult<TData = unknown, TError = unknown, TVariables = unknown> {
    mutate: (variables: TVariables) => void;
    isPending: boolean;
    isError: boolean;
    error: TError | null;
    data?: TData;
  }
  export function useQuery<TData = unknown, TError = unknown>(
    options: UseQueryOptions<TData, TError>
  ): UseQueryResult<TData, TError>;
  export function useMutation<TData = unknown, TError = unknown, TVariables = unknown>(
    options: UseMutationOptions<TData, TError, TVariables>
  ): UseMutationResult<TData, TError, TVariables>;
  export function useQueryClient(): QueryClient;
}

declare module 'react-i18next' {
  import { i18n } from 'i18next';
  
  export interface UseTranslationOptions {
    i18n?: i18n;
    useSuspense?: boolean;
  }
  
  export interface TFunction {
    (key: string, options?: object): string;
    (key: string[], options?: object): string[];
  }
  
  export interface UseTranslationResponse {
    t: TFunction;
    i18n: i18n;
    ready: boolean;
  }
  
  export function useTranslation(
    ns?: string | string[],
    options?: UseTranslationOptions
  ): UseTranslationResponse;
} 