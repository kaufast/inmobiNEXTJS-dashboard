import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export type ChatMessage = {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  searchParams?: any;
  createdAt?: Date;
}

export type ChatConversation = {
  id: number;
  userId: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useChatConversations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    data: conversations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/chat/conversations'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/chat/conversations');
      const data = await res.json();
      return data as ChatConversation[];
    }
  });
  
  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest('POST', '/api/chat/conversations', { title });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      toast({
        title: 'Conversation created',
        description: 'Your new chat conversation has been created',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating conversation',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  return {
    conversations,
    isLoading,
    error,
    createConversation: (title: string) => createConversationMutation.mutate(title),
    isCreating: createConversationMutation.isPending,
  };
}

export function useChatConversation(conversationId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchResults, setSearchResults] = useState<any>(null);
  
  const {
    data: conversation,
    isLoading: isLoadingConversation,
    error: conversationError,
  } = useQuery({
    queryKey: ['/api/chat/conversations', conversationId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/chat/conversations/${conversationId}`);
      return res.json() as Promise<ChatConversation>;
    },
    enabled: !!conversationId,
  });
  
  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery({
    queryKey: ['/api/chat/conversations', conversationId, 'messages'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/chat/conversations/${conversationId}`);
      const data = await res.json();
      return data.messages as ChatMessage[];
    },
    enabled: !!conversationId,
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest('POST', `/api/chat/conversations/${conversationId}/messages`, { content });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations', conversationId, 'messages'] });
      
      // Store search results if available
      if (data.searchResults) {
        setSearchResults(data.searchResults);
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error sending message',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  return {
    conversation,
    messages,
    searchResults,
    isLoading: isLoadingConversation || isLoadingMessages,
    error: conversationError || messagesError,
    sendMessage: (content: string) => sendMessageMutation.mutate(content),
    isSending: sendMessageMutation.isPending,
  };
}

// This hook handles the property matching AI chat that doesn't require a conversation context
export function usePropertyMatchingChat() {
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<any>(null);
  
  const sendChatMutation = useMutation({
    mutationFn: async (input: { messages: ChatMessage[], userPreferences?: any }) => {
      const res = await apiRequest('POST', '/api/ai/property-matching/chat', input);
      return res.json();
    },
    onSuccess: (data) => {
      // If search results are available, update the state
      if (data.searchParams) {
        // Fetch properties matching the search parameters
        apiRequest('POST', '/api/ai/property-matching/extract-params', { 
          messages: [{ role: 'user', content: data.message }] 
        })
          .then(res => res.json())
          .then(data => {
            if (data.properties) {
              setSearchResults(data.properties);
            }
          })
          .catch(err => {
            console.error('Error fetching search results:', err);
          });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error with property matching chat',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Make sendChat return a promise with the result
  const sendChat = async (messages: ChatMessage[], userPreferences?: any) => {
    try {
      return await sendChatMutation.mutateAsync({ messages, userPreferences });
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  };
  
  return {
    searchResults,
    sendChat,
    isSending: sendChatMutation.isPending,
    clearSearchResults: () => setSearchResults(null),
  };
}