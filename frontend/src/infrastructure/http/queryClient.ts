import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,       // 1 min
      gcTime: 1000 * 60 * 5,      // 5 min
      retry: (failureCount, error) => {
        const status = (error as AxiosError)?.response?.status;
        if (status && status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      onError: (error: unknown) => {
        const msg =
          (error as AxiosError<{ message?: string }>)?.response?.data?.message ??
          'Something went wrong. Please try again.';
        toast.error(msg);
      },
    },
  },
});
