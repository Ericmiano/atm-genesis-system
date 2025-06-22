import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, mutationKeys, optimisticUpdates } from '@/lib/queryClient';
import { supabaseATMService } from '@/services/supabaseATMService';
import { useApiRetry } from './useRetryRequest';

// User related hooks
export const useUserProfile = (userId?: string) => {
  const { executeWithRetry } = useApiRetry(supabaseATMService.getCurrentUser, 'temporary');
  
  return useQuery({
    queryKey: queryKeys.user.profile(userId),
    queryFn: executeWithRetry,
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes for user profile
  });
};

export const useUserBalance = (userId?: string) => {
  const { executeWithRetry } = useApiRetry(
    async () => {
      const user = await supabaseATMService.getCurrentUser();
      return user?.balance || 0;
    },
    'temporary'
  );
  
  return useQuery({
    queryKey: queryKeys.user.balance(userId),
    queryFn: executeWithRetry,
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds for balance
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Transaction related hooks
export const useTransactions = (userId?: string) => {
  const { executeWithRetry } = useApiRetry(supabaseATMService.getTransactionHistory, 'temporary');
  
  return useQuery({
    queryKey: queryKeys.transactions.list(userId),
    queryFn: executeWithRetry,
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute for transactions
  });
};

export const useRecentTransactions = (userId?: string, limit: number = 5) => {
  const { executeWithRetry } = useApiRetry(
    async () => {
      const transactions = await supabaseATMService.getTransactionHistory();
      return transactions.slice(0, limit);
    },
    'temporary'
  );
  
  return useQuery({
    queryKey: queryKeys.transactions.recent(userId),
    queryFn: executeWithRetry,
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds for recent transactions
  });
};

// Loan related hooks
export const useLoans = (userId?: string) => {
  const { executeWithRetry } = useApiRetry(
    async () => {
      const user = await supabaseATMService.getCurrentUser();
      if (user?.role === 'ADMIN') {
        return await supabaseATMService.getAllLoans();
      }
      return await supabaseATMService.getUserLoans();
    },
    'temporary'
  );
  
  return useQuery({
    queryKey: queryKeys.loans.list(userId),
    queryFn: executeWithRetry,
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes for loans
  });
};

export const useLoanEligibility = (userId?: string) => {
  const { executeWithRetry } = useApiRetry(
    async () => {
      // This would be implemented in the service layer
      return {
        eligible: true,
        maxAmount: 500000,
        creditScore: 720,
        interestRate: 12
      };
    },
    'temporary'
  );
  
  return useQuery({
    queryKey: queryKeys.loans.eligibility(userId),
    queryFn: executeWithRetry,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes for eligibility
  });
};

// Bill related hooks
export const useBills = (userId?: string) => {
  const { executeWithRetry } = useApiRetry(supabaseATMService.getBills, 'temporary');
  
  return useQuery({
    queryKey: queryKeys.bills.list(userId),
    queryFn: executeWithRetry,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes for bills
  });
};

export const useUpcomingBills = (userId?: string) => {
  const { executeWithRetry } = useApiRetry(
    async () => {
      const bills = await supabaseATMService.getBills();
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      return bills.filter(bill => {
        const dueDate = new Date(bill.dueDate);
        return dueDate >= now && dueDate <= weekFromNow;
      });
    },
    'temporary'
  );
  
  return useQuery({
    queryKey: queryKeys.bills.upcoming(userId),
    queryFn: executeWithRetry,
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute for upcoming bills
  });
};

// Admin related hooks
export const useAdminUsers = () => {
  const { executeWithRetry } = useApiRetry(supabaseATMService.getAllUsers, 'temporary');
  
  return useQuery({
    queryKey: queryKeys.admin.users(),
    queryFn: executeWithRetry,
    staleTime: 2 * 60 * 1000, // 2 minutes for admin users
  });
};

export const useAdminTransactions = () => {
  const { executeWithRetry } = useApiRetry(supabaseATMService.getTransactionHistory, 'temporary');
  
  return useQuery({
    queryKey: queryKeys.admin.transactions(),
    queryFn: executeWithRetry,
    staleTime: 60 * 1000, // 1 minute for admin transactions
  });
};

// Mutation hooks
export const useUpdateBalance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: mutationKeys.user.updateBalance(),
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      // This would be implemented in the service layer
      return { success: true, newBalance: 125000 + amount };
    },
    onMutate: async ({ userId, amount }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.user.balance(userId) });
      
      // Snapshot the previous value
      const previousBalance = queryClient.getQueryData(queryKeys.user.balance(userId));
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.user.balance(userId), (old: number) => old + amount);
      
      // Return a context object with the snapshotted value
      return { previousBalance };
    },
    onError: (err, { userId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousBalance !== undefined) {
        queryClient.setQueryData(queryKeys.user.balance(userId), context.previousBalance);
      }
    },
    onSettled: (data, error, { userId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.user.balance(userId) });
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: mutationKeys.transactions.create(),
    mutationFn: async (transactionData: any) => {
      // This would be implemented in the service layer
      return { ...transactionData, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
    },
    onMutate: async (newTransaction) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions.list(newTransaction.userId) });
      
      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData(queryKeys.transactions.list(newTransaction.userId));
      
      // Optimistically update to the new value
      queryClient.setQueryData(
        queryKeys.transactions.list(newTransaction.userId),
        (old: any[]) => [newTransaction, ...(old || [])]
      );
      
      // Return a context object with the snapshotted value
      return { previousTransactions };
    },
    onError: (err, newTransaction, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTransactions !== undefined) {
        queryClient.setQueryData(
          queryKeys.transactions.list(newTransaction.userId),
          context.previousTransactions
        );
      }
    },
    onSettled: (data, error, newTransaction) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.list(newTransaction.userId) });
    },
  });
};

export const useApplyLoan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: mutationKeys.loans.apply(),
    mutationFn: async (loanData: any) => {
      // This would be implemented in the service layer
      return { ...loanData, id: crypto.randomUUID(), status: 'PENDING', applicationDate: new Date().toISOString() };
    },
    onSuccess: (newLoan) => {
      // Invalidate and refetch loans list
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.list(newLoan.userId) });
    },
  });
};

export const usePayBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: mutationKeys.bills.pay(),
    mutationFn: async ({ billId, userId }: { billId: string; userId: string }) => {
      // This would be implemented in the service layer
      return { success: true, billId, userId };
    },
    onSuccess: (data) => {
      // Invalidate and refetch bills list
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.list(data.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.upcoming(data.userId) });
    },
  });
};

// Utility hooks
export const usePrefetchQueries = () => {
  const queryClient = useQueryClient();
  
  const prefetchUserData = async (userId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.user.profile(userId),
        queryFn: () => supabaseATMService.getCurrentUser(),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.user.balance(userId),
        queryFn: async () => {
          const user = await supabaseATMService.getCurrentUser();
          return user?.balance || 0;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.transactions.recent(userId),
        queryFn: async () => {
          const transactions = await supabaseATMService.getTransactionHistory();
          return transactions.slice(0, 5);
        },
      }),
    ]);
  };
  
  return { prefetchUserData };
}; 