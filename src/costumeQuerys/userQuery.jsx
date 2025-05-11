import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

// Fetch current user data
export const useFetchUser = () => {
  const { isPending, data, isError, error } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      const { data } = await api.get('/auth/me');
      return data
    },
    enabled: !!localStorage.getItem('token')
  })
  return { isPending, isError, error, data }
}

// Login
export const useLogin = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const queryClient = useQueryClient()

  const { mutate: login, isPending, isError, error } = useMutation({
    mutationFn: (credentials) => api.post('/auth/login', credentials),
    onSuccess: async (res) => {
      localStorage.setItem("token", res.data.token);
      setIsAuthenticated(true);
      
      try {
        const userData = await api.get('/auth/me');
        if (userData.data && userData.data.role === 'super') {
          navigate('/admin/user-management', { replace: true });
        } else {
          navigate('/app/home', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/app/home', { replace: true });
      }
      
      // refresh user data
      queryClient.invalidateQueries({ queryKey: ['userData'] });
      toast.success('Login successful');
    },
    onError: (error) => {
      if (error.response) {
        return error;
      }
    },
  })

  return { login, isPending, isError, error }
}

// Signup
export const useSignup = () => {
  const queryClient = useQueryClient()

  const { mutate: signup, isLoading } = useMutation({
    mutationFn: (userData) => api.post('/auth/register', userData),
    onSuccess: () => {
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['userData'] })
      toast.success('Signup successful')
      navigate('/app/home')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Signup failed')
    },
  })

  return { signup, isLoading }
}

// Update user password
export const useUpdateUserPassword = (userId) => {
  const { mutate: updatePassword, isLoading } = useMutation({
    mutationFn: (passwords) => api.put(`/users/${userId}/password`, passwords),
    onSuccess: () => {
      toast.success('Password updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update password')
    },
  })

  return { updatePassword, isLoading }
}

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  const { mutate: deleteUser, isLoading } = useMutation({
    mutationFn: (userId) => api.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userList'] })
      toast.success('User deleted')
    },
    onError: () => toast.error('Failed to delete user'),
  })

  return { deleteUser, isLoading }
}

// Logout
export const useLogout = () => {
  const queryClient = useQueryClient()

  const { mutate: logout, isLoading } = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      queryClient.clear()
      toast.success('Logged out')
    },
  })

  return { logout, isLoading }
}

// Fetch user list (admin)
export const useFetchUserList = (page = 1, limit = 10) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['userList', page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users?page=${page}&limit=${limit}`)
      return data
    },
  })

  return { data, isLoading, isError, error }
}

// Block user (admin blacklist)
export const useBlockUser = () => {
  const queryClient = useQueryClient()

  const { mutate: blockUser, isLoading } = useMutation({
    mutationFn: ({ requestId, action }) =>
      api.post(`/admin/blacklist/${requestId}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] })
      toast.success('Action successful')
    },
    onError: () => toast.error('Action failed'),
  })

  return { blockUser, isLoading }
}

// Search users
export const useSearchUsers = (query) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['searchUsers', query],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users/search?q=${query}`)
      return data
    },
    enabled: !!query, // Avoid request if query is empty
  })

  return { data, isLoading, isError }
}

// Report incorrect suggestion
export const useReportIncorrectSuggestion = () => {
  const queryClient = useQueryClient()

  const { mutate: reportSuggestion, isPending } = useMutation({
    mutationFn: ({ originalText, llmSuggestion, userExplanation }) => 
      api.post('/users/report-suggestion', { 
        originalText, 
        llmSuggestion, 
        userExplanation 
      }),
    onSuccess: () => {
      toast.success('Report submitted. Thank you for helping improve our system.')
    },
    onError: () => {
      toast.error('Failed to submit report. Please try again.')
    }
  })

  return { reportSuggestion, isPending }
}
