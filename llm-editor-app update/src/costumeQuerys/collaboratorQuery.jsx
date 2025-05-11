import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

// fetch collaborator list
export const useFetchCollaboratorList = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['collaboratorList'],
    queryFn: async () => {
      const { data } = await api.get('/users/collaborator-list');
      return data;
    },
    select: (data) => {
      return data?.collaborators || [];
    }
  })
  return { data, isPending, isError }
}

// search collaborator
export const useSearchCollaborator = (searchName) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['searchCollaborator', searchName],
    queryFn: async () => {
      if (!searchName) return { searched_user: [] };
      const { data } = await api.get(`/users/search-collaborator?searchName=${searchName}`);
      return data;
    },
    select: (data) => {
      return data?.searched_user || [];
    },
  })
  return { data, isPending, isError }
}

// invite collaborator
export const useInviteCollaborator = () => {
  const queryClient = useQueryClient()
  const { mutate: inviteCollaborator, isPending, isError, error } = useMutation({
    mutationFn: (inviteUsername) => api.post('/users/invite-collaborator', { inviteUsername }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['collaboratorList'] });
      toast.success('Invitation sent successfully');
    },
    onError: (error) => {
      toast.error('Failed to send invitation: ' + (error.response?.data?.detail || error.message));
    }
  })
  return { inviteCollaborator, isPending, isError, error }
}

// remove collaborator
export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient()
  const { mutate: removeCollaborator, isPending, isError, error } = useMutation({
    mutationFn: (email) => api.post('/users/remove-collaborator', { email }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['collaboratorList'] });
    },
    onError: (error) => {
      console.log(error);
      toast.error('Failed to remove collaborator');
    }
  })
  return { removeCollaborator, isPending, isError, error }
}

// submit collaborator complaint
export const useSubmitComplaint = () => {
  const { mutate: submitComplaint, isPending, isError, error } = useMutation({
    mutationFn: (complaintData) => api.post('/users/submit-complaint', complaintData),
    onSuccess: async () => {
      toast.success('Complaint submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit complaint: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  })
  return { submitComplaint, isPending, isError, error }
}

// fetch invitations
export const useFetchInvitations = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data } = await api.get('/users/invitations');
      return data;
    }
  })
  return { data, isPending, isError }
}

// handle invitation (accept/reject)
export const useHandleInvitation = () => {
  const queryClient = useQueryClient()
  const { mutate: handleInvitation, isPending, isError, error } = useMutation({
    mutationFn: ({ invitationId, action }) => 
      api.post(`/users/invitations/${invitationId}/${action}`),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['collaboratorList'] });
      toast.success('Invitation processed successfully');
    },
    onError: (error) => {
      toast.error('Failed to process invitation: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  })
  return { handleInvitation, isPending, isError, error }
}

