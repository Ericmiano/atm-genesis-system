import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for critical data
      refetchOnWindowFocus: (query) => {
        // Only refetch critical data like balance and transactions
        const criticalQueries = ['balance', 'transactions', 'user'];
        return criticalQueries.some(key => query.queryKey.includes(key));
      },
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations only once
      retry: 1,
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // User related queries
  user: {
    all: ['user'] as const,
    profile: (id?: string) => [...queryKeys.user.all, 'profile', id] as const,
    balance: (id?: string) => [...queryKeys.user.all, 'balance', id] as const,
    settings: (id?: string) => [...queryKeys.user.all, 'settings', id] as const,
  },
  
  // Transaction related queries
  transactions: {
    all: ['transactions'] as const,
    list: (userId?: string) => [...queryKeys.transactions.all, 'list', userId] as const,
    recent: (userId?: string) => [...queryKeys.transactions.all, 'recent', userId] as const,
    byId: (id: string) => [...queryKeys.transactions.all, 'detail', id] as const,
  },
  
  // Loan related queries
  loans: {
    all: ['loans'] as const,
    list: (userId?: string) => [...queryKeys.loans.all, 'list', userId] as const,
    byId: (id: string) => [...queryKeys.loans.all, 'detail', id] as const,
    eligibility: (userId?: string) => [...queryKeys.loans.all, 'eligibility', userId] as const,
  },
  
  // Bill related queries
  bills: {
    all: ['bills'] as const,
    list: (userId?: string) => [...queryKeys.bills.all, 'list', userId] as const,
    upcoming: (userId?: string) => [...queryKeys.bills.all, 'upcoming', userId] as const,
  },
  
  // Admin related queries
  admin: {
    all: ['admin'] as const,
    users: () => [...queryKeys.admin.all, 'users'] as const,
    transactions: () => [...queryKeys.admin.all, 'transactions'] as const,
    metrics: () => [...queryKeys.admin.all, 'metrics'] as const,
    fraudAlerts: () => [...queryKeys.admin.all, 'fraud-alerts'] as const,
  },
  
  // System related queries
  system: {
    all: ['system'] as const,
    metrics: () => [...queryKeys.system.all, 'metrics'] as const,
    health: () => [...queryKeys.system.all, 'health'] as const,
  },
} as const;

// Mutation keys factory
export const mutationKeys = {
  // User mutations
  user: {
    updateProfile: () => ['user', 'update-profile'] as const,
    updateBalance: () => ['user', 'update-balance'] as const,
    changePassword: () => ['user', 'change-password'] as const,
  },
  
  // Transaction mutations
  transactions: {
    create: () => ['transactions', 'create'] as const,
    update: () => ['transactions', 'update'] as const,
    delete: () => ['transactions', 'delete'] as const,
  },
  
  // Loan mutations
  loans: {
    apply: () => ['loans', 'apply'] as const,
    approve: () => ['loans', 'approve'] as const,
    reject: () => ['loans', 'reject'] as const,
    pay: () => ['loans', 'pay'] as const,
  },
  
  // Bill mutations
  bills: {
    create: () => ['bills', 'create'] as const,
    pay: () => ['bills', 'pay'] as const,
    delete: () => ['bills', 'delete'] as const,
  },
} as const;

// Optimistic update helpers
export const optimisticUpdates = {
  // Update balance optimistically
  updateBalance: (userId: string, amount: number) => ({
    queryKey: queryKeys.user.balance(userId),
    updater: (oldBalance: number) => oldBalance + amount,
  }),
  
  // Add transaction to list optimistically
  addTransaction: (userId: string, transaction: any) => ({
    queryKey: queryKeys.transactions.list(userId),
    updater: (oldTransactions: any[]) => [transaction, ...oldTransactions],
  }),
  
  // Update loan status optimistically
  updateLoanStatus: (loanId: string, status: string) => ({
    queryKey: queryKeys.loans.byId(loanId),
    updater: (oldLoan: any) => ({ ...oldLoan, status }),
  }),
} as const; 