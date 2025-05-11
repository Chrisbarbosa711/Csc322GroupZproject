import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '../lib/api'

// Fetch user document list with filtering and sorting
export const useDocumentList = (filterType = null, sortBy = 'latest_update') => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['documents', filterType, sortBy],
    queryFn: async () => {
      let url = '/documents';
      const params = new URLSearchParams();
      
      if (filterType) {
        params.append('filter_type', filterType);
      }
      
      if (sortBy) {
        params.append('sort_by', sortBy);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const { data } = await api.get(url);
      return data;
    },
    select: (data) => data.documents
  });

  return { data, isPending, isError };
}

// Fetch document collaborators
export const useDocumentCollaborators = (documentId) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['documentCollaborators', documentId],
    queryFn: async () => {
      const { data } = await api.get(`/documents/${documentId}/collaborators`);
      return data;
    },
    enabled: !!documentId,
  });

  return { data, isPending, isError };
}

// Add document collaborator
export const useAddDocumentCollaborator = () => {
  const queryClient = useQueryClient();
  const { mutate: addCollaborator, isPending, isError, error } = useMutation({
    mutationFn: async ({ documentId, username }) => {
      await api.post(`/documents/${documentId}/add-collaborator?collaborator_username=${username}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentCollaborators', variables.documentId] });
      toast.success(`Collaborator added successfully`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to add collaborator');
    }
  });

  return { addCollaborator, isPending, isError, error };
}

// Remove document collaborator
export const useRemoveDocumentCollaborator = () => {
  const queryClient = useQueryClient();
  const { mutate: removeCollaborator, isPending, isError, error } = useMutation({
    mutationFn: async ({ documentId, username }) => {
      await api.post(`/documents/${documentId}/remove-collaborator?collaborator_username=${username}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentCollaborators', variables.documentId] });
      toast.success(`Collaborator removed successfully`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to remove collaborator');
    }
  });

  return { removeCollaborator, isPending, isError, error };
}

// Fetch single document with collaborators
export const useDocumentDetail = (documentId) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      const { data } = await api.get(`/documents/detail/${documentId}`);
      return data;
    },
    enabled: !!documentId,
  });

  return { data, isPending, isError };
}

// save document
export const useSaveDocument = () => {
  const queryClient = useQueryClient();
  const { mutate: saveDocument, isPending, isError } = useMutation({
    mutationFn: async (document) => {
      const { data } = await api.post('/documents', document);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => {
      toast.error('Failed to save document');
    }
  });

  return { saveDocument, isPending, isError };
}

// update document
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  const { mutate: updateDocument, isPending, isError } = useMutation({
    mutationFn: async (document) => {
      const { data } = await api.put(`/documents/${document.id}`, document);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => {
      console.error("error:", error);
      toast.error('Failed to update document');
    }
  });

  return { updateDocument, isPending, isError };
}

// delete document
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const { mutate: deleteDocument, isPending, isError } = useMutation({
    mutationFn: async (documentId) => {
      const { data } = await api.delete(`/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => {
      toast.error('Failed to delete document');
    }
  });

  return { deleteDocument, isPending, isError };
} 

// fetch document stats
export const useDocumentStats = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['documentStats'],
    queryFn: async () => {
      const { data } = await api.get('/documents/stats');
      return data;
    }
  });

  return { data, isPending, isError };
}