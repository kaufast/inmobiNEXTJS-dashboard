import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '@/lib/queryClient';
import { Property } from '@shared/schema';

export function usePropertiesData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation(['dashboard', 'common', 'properties']);
  const queryClient = useQueryClient();

  // Fetch properties - SERVER-FIRST APPROACH (no optimistic state)
  const { data: properties = [], isLoading, isError } = useQuery<Property[]>({
    queryKey: ['my-properties', user?.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/properties?ownerId=${user!.id}`);
      return await res.json();
    },
    enabled: !!user?.id,
    // ✅ NO onSuccess callback that causes sync issues
  });

  // Single delete mutation - ALWAYS invalidates cache
  const deleteMutation = useMutation({
    mutationFn: (propertyId: number) => apiRequest('DELETE', `/api/properties/${propertyId}`),
    onSuccess: () => {
      toast({ 
        title: t('agentProperties.delete.success.title'), 
        description: t('agentProperties.delete.success.description') 
      });
      // ✅ Always invalidate to refresh from server (consistent behavior)
      queryClient.invalidateQueries({ queryKey: ['my-properties', user?.id] });
    },
    onError: (error: any) => {
      toast({ 
        title: t('agentProperties.delete.error.title'),
        description: error.message || t('agentProperties.delete.error.description'),
        variant: 'destructive' 
      });
      // ✅ No rollback needed - server is source of truth
    },
  });

  // Bulk delete mutation - CONSISTENT with single delete
  const bulkDeleteMutation = useMutation({
    mutationFn: async (propertyIds: number[]) => {
      await Promise.all(propertyIds.map(id => 
        apiRequest('DELETE', `/api/properties/${id}`)
      ));
    },
    onSuccess: (_, propertyIds) => {
      toast({ 
        title: t('agentProperties.delete.success.title'),
        description: `Successfully deleted ${propertyIds.length} properties` 
      });
      // ✅ Same strategy as single delete
      queryClient.invalidateQueries({ queryKey: ['my-properties', user?.id] });
    },
    onError: (error: any) => {
      toast({ 
        title: t('agentProperties.delete.error.title'),
        description: error.message || t('agentProperties.delete.error.description'),
        variant: 'destructive' 
      });
    },
  });

  return {
    properties,
    isLoading,
    isError,
    deleteProperty: (propertyId: number) => deleteMutation.mutate(propertyId),
    bulkDeleteProperties: (propertyIds: number[]) => bulkDeleteMutation.mutate(propertyIds),
    isDeleting: deleteMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
  };
}