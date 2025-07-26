import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import { User } from '@shared/schema';

export function useMessageFavorites() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Get favorite users
  const {
    data: favoriteUsers = [],
    isLoading: isLoadingFavorites,
    error: favoritesError,
    refetch: refetchFavorites,
  } = useQuery({
    queryKey: ['/api/message-favorites'],
    enabled: !!user,
    select: (data) => data as User[],
    refetchOnWindowFocus: false,
  });

  // Check if a specific user is favorited
  const {
    data: isFavorited = false,
    isLoading: isCheckingFavorite,
    refetch: refetchIsFavorited,
  } = useQuery({
    queryKey: ['/api/message-favorites/check', selectedUserId],
    enabled: !!user && !!selectedUserId,
    select: (data) => data as boolean,
    refetchOnWindowFocus: false,
  });

  // Add user to favorites
  const { 
    mutate: addToFavorites, 
    isPending: isAddingFavorite,
    error: addFavoriteError 
  } = useMutation({
    mutationFn: async (targetId: number) => {
      const response = await apiRequest('POST', '/api/message-favorites', { 
        targetId, 
        targetType: 'user',
        notes: '' // Optional notes field
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t('messages.favoriteAdded'),
        description: t('messages.favoriteAddedDescription'),
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/message-favorites'] });
      
      if (selectedUserId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/message-favorites/check', selectedUserId]
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: t('messages.favoriteAddError'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove user from favorites
  const { 
    mutate: removeFromFavorites, 
    isPending: isRemovingFavorite,
    error: removeFavoriteError 
  } = useMutation({
    mutationFn: async (targetId: number) => {
      const response = await apiRequest('DELETE', `/api/message-favorites/${targetId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t('messages.favoriteRemoved'),
        description: t('messages.favoriteRemovedDescription'),
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/message-favorites'] });
      
      if (selectedUserId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/message-favorites/check', selectedUserId]
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: t('messages.favoriteRemoveError'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle favorite status
  const toggleFavorite = (targetId: number) => {
    setSelectedUserId(targetId);
    
    if (isFavorited) {
      removeFromFavorites(targetId);
    } else {
      addToFavorites(targetId);
    }
  };

  // Check if a user is favorited
  const checkIsFavorited = (userId: number) => {
    setSelectedUserId(userId);
    refetchIsFavorited();
  };

  return {
    favoriteUsers,
    isLoadingFavorites,
    favoritesError,
    isFavorited,
    isCheckingFavorite,
    addToFavorites,
    isAddingFavorite,
    addFavoriteError,
    removeFromFavorites,
    isRemovingFavorite,
    removeFavoriteError,
    toggleFavorite,
    checkIsFavorited,
    selectedUserId,
    refetchFavorites,
  };
}