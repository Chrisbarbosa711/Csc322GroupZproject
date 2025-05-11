import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '../lib/api'

// Fetch token balance

// deduct tokens
export const useDeductTokens = () => {
  const queryClient = useQueryClient()

  const { mutate: deductTokens, isPending, isError, error } = useMutation({
    mutationFn: (amount) => api.post('/users/deduct-tokens', { amount }),
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ['userData'] });
    },
    onError: (error) => {
      toast.error('Failed to deduct tokens');
    }
  })

  return { deductTokens, isPending, isError, error }
}

// buy tokens
export const useBuyTokens = () => {
  const queryClient = useQueryClient()

  const { mutate: buyTokens, isPending, isError, error } = useMutation({
    mutationFn: (amount) => api.post('/users/buy-tokens', { amount }),
    onSuccess: async (res) => {
      toast.success('Tokens purchased successfully');
      queryClient.invalidateQueries({ queryKey: ['userData'] });
    },
    onError: (error) => {
      toast.error('Failed to buy tokens');
    }
  })

  return { buyTokens, isPending, isError, error }
}

// reward tokens
export const useRewardTokens = () => {
  const queryClient = useQueryClient()

  const { mutate: rewardTokens, isPending, isError, error } = useMutation({
    mutationFn: (amount) => api.post('/users/reward-tokens', { amount }),
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ['userData'] });
    },
    onError: (error) => {
      toast.error('Failed to reward tokens');
    }
  })

  return { rewardTokens, isPending, isError, error }
}

// fetch token stats
export const useFetchTokenStats = () => {
  const queryClient = useQueryClient()

  const { data: tokenStats, isPending, isError, error } = useQuery({
    queryKey: ['tokenStats'],
    queryFn: () => api.get('/users/token-stats'),
    onError: (error) => {
      toast.error('Failed to fetch token stats');
    }
  })

  return { tokenStats, isPending, isError, error }
}