import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '../lib/api'

// Get user list
export const useFetchUserList = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['adminUsers', page, limit],
    queryFn: async () => {
      try {
        console.log('Fetching users list with:', { page, limit });
        const { data } = await api.get(`/admin/users?page=${page}&limit=${limit}`);
        
        // Log and validate response data
        console.log('User data received:', data);
        
        // Ensure users array exists and has expected format
        if (!data || !Array.isArray(data.users)) {
          console.warn('Invalid user data format:', data);
          return { users: [] };
        }
        
        // Ensure each user has the required fields
        const processedUsers = data.users.map(user => ({
          ...user,
          // Ensure all users have standard fields with defaults
          id: user.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          username: user.username || 'Unknown',
          email: user.email || '',
          role: user.role || 'user',
          status: user.status || 'active', // Default to active if status is missing
          tokens: user.tokens || 0,
          lastActive: user.lastActive || null
        }));
        
        return { ...data, users: processedUsers };
      } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error(error.response?.data?.message || 'Failed to load users. Please try again.');
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

// Delete a user
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId) => api.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      toast.success('User deleted')
    },
    onError: () => toast.error('Failed to delete user'),
  })
}

// Block or unblock a user
export const useBlockOrUnblockUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, action }) =>
      api.post(`/admin/users/${userId}/${action}`), // action: 'block' or 'unblock'
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      toast.success('User status updated')
    },
    onError: (error) => toast.error(`Failed to update user status: ${error.message || 'Unknown error'}`),
  })
}

// Get blacklist word list
export const useFetchBlacklistWords = () => {
  return useQuery({
    queryKey: ['blacklist'],
    queryFn: async () => {
      const { data } = await api.get('/admin/blacklist')
      return data
    },
  })
}

// Approve/reject blacklist word request
export const useHandleBlacklistRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, action }) =>
      api.post(`/admin/blacklist/${requestId}/${action}`), // approve or reject
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] })
      toast.success('Blacklist request handled')
    },
    onError: () => toast.error('Failed to process blacklist request'),
  })
}

// Remove word from blacklist
export const useRemoveBlacklistWord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (word) => 
      api.post('/admin/blacklist/remove', { word }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] })
      toast.success(`Word "${variables}" removed from blacklist`)
    },
    onError: () => toast.error('Failed to remove word from blacklist'),
  })
}

// Add word to blacklist
export const useAddBlacklistWord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (word) => 
      api.post('/admin/blacklist/add', { word }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] })
      toast.success(`Word "${variables}" added to blacklist`)
    },
    onError: () => toast.error('Failed to add word to blacklist'),
  })
}

// Get incorrection suggestions list
export const useFetchIncorrectionSuggestions = () => {
  return useQuery({
    queryKey: ['incorrectionSuggestions'],
    queryFn: async () => {
      const { data } = await api.get('/admin/suggestions') // Replace with actual endpoint if different
      return data
    },
  })
}

// Approve/reject incorrection suggestion
export const useHandleSuggestionRequest = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ suggestionId, action, improveModel = false }) =>
      api.post(`/admin/suggestions/${suggestionId}/${action}`, { improveModel }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['incorrectionSuggestions'] })
      toast.success('Suggestion processed successfully')
      if (options.onSuccess) options.onSuccess(data)
    },
    onError: (error) => {
      toast.error(`Failed to process suggestion: ${error.message || 'Unknown error'}`)
      if (options.onError) options.onError(error)
    },
  })
}

// Get complaints
export const useFetchComplaints = (status = 'pending') => {
  return useQuery({
    queryKey: ['complaints', status],
    queryFn: async () => {
      const url = status ? `/admin/complaints?status=${status}` : '/admin/complaints'
      const { data } = await api.get(url)
      return data
    },
  })
}

// Handle complaint (approve/reject) and apply penalties
export const useHandleComplaint = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ complaintId, action, response, penalty }) =>
      api.post(`/admin/complaints/${complaintId}/${action}`, {
        response,    // admin comment or reason
        penalty,     // { block: true, delete: false, deductTokens: 50 }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] })
      toast.success('Complaint processed')
    },
    onError: () => toast.error('Failed to process complaint'),
  })
}
