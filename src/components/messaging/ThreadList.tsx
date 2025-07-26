import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Circle, MailOpen, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { MessageFolder } from './MessageFolders';

interface Thread {
  id: number;
  subject: string;
  preview: string;
  lastActivityAt: string;
  createdById: number;
  assignedToId: number | null;
  messageType: 'direct' | 'support' | 'system';
  status: 'unread' | 'read' | 'archived';
  isArchived: boolean;
  creator?: {
    id: number;
    username: string;
    name?: string;
    avatar?: string;
  };
  assignedTo?: {
    id: number;
    username: string;
    name?: string;
    avatar?: string;
  };
}

interface ThreadListProps {
  selectedFolder: MessageFolder;
  selectedThreadId: number | null;
  onSelectThread: (thread: Thread) => void;
  onNewMessage: () => void;
}

export const ThreadList: React.FC<ThreadListProps> = ({
  selectedFolder,
  selectedThreadId,
  onSelectThread,
  onNewMessage
}) => {
  const { t, ready } = useTranslation('dashboard');
  const { toast } = useToast();
  const [hasNetworkError, setHasNetworkError] = React.useState(false);
  
  // Helper function to get translation with fallback
  const getTranslation = (key: string, fallback: string) => {
    // Temporarily return hardcoded text to debug translation issues
    const hardcodedTexts: Record<string, string> = {
      'messages.newMessage': 'New Message',
      'messages.errorLoadingThreads': 'Error Loading Conversations',
      'messages.errorLoadingThreadsDescription': 'There was a problem loading your conversations. Please try again.',
      'messages.retry': 'Retry',
      'messages.retryingThreads': 'Retrying to load conversations...',
      'messages.emptyFolder': 'No messages in this folder',
      'messages.noPreview': 'No message preview'
    };
    
    return hardcodedTexts[key] || fallback;
  };
  
  // Fetch threads based on the selected folder
  const { 
    data: threads, 
    isLoading, 
    isError,
    error,
    refetch,
    isRefetching
  } = useQuery<Thread[]>({
    queryKey: ['message-threads', selectedFolder],
    queryFn: async () => {
      try {
        setHasNetworkError(false);
        const res = await apiRequest('GET', `/api/messages/threads?folder=${selectedFolder}`);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching message threads:", error);
        setHasNetworkError(true);
        throw error; // Let React Query handle the error
      }
    },
    retry: 2, // Automatically retry failed requests twice
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    onError: (err) => {
      console.error('Failed to load threads:', err);
    }
  });
  
  // Handle thread selection with error handling
  const handleThreadClick = async (thread: Thread) => {
    onSelectThread(thread);
    
    // Mark thread as read if it's currently unread
    if (thread.status === 'unread') {
      try {
        await apiRequest('POST', `/api/messages/threads/${thread.id}/read`);
        // Update the thread in the cache
        const currentThreads = queryClient.getQueryData<Thread[]>(['message-threads', selectedFolder]);
        if (currentThreads) {
          const updatedThreads = currentThreads.map(t => 
            t.id === thread.id ? { ...t, status: 'read' } : t
          );
          queryClient.setQueryData(['message-threads', selectedFolder], updatedThreads);
        }
      } catch (error) {
        console.error("Error marking thread as read:", error);
        // Don't show a toast here to avoid interrupting the user experience
      }
    }
  };

  // Handle retry
  const handleRetry = React.useCallback(() => {
    toast({
      description: t('messages.retryingThreads'),
    });
    refetch();
  }, [refetch, toast, t]);

  return (
    <div className="flex flex-col h-full border-r border-border">
      <div className="p-4 border-b border-border">
        <Button 
          onClick={onNewMessage}
          className="w-full"
        >
          {getTranslation('messages.newMessage', 'New Message')}
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        {isLoading || isRefetching ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isError || hasNetworkError ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <Alert variant="destructive" className="mb-4 max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('messages.errorLoadingThreads')}</AlertTitle>
              <AlertDescription>
                {t('messages.errorLoadingThreadsDescription')}
              </AlertDescription>
            </Alert>
            <Button onClick={handleRetry} className="mt-2 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {t('messages.retry')}
            </Button>
          </div>
        ) : threads && threads.length > 0 ? (
          <div className="divide-y divide-border">
            {threads.map((thread) => {
              const isSelected = selectedThreadId === thread.id;
              const isUnread = thread.status === 'unread';
              
              return (
                <button
                  key={thread.id}
                  onClick={() => handleThreadClick(thread)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-accent transition-colors",
                    isSelected && "bg-accent",
                    isUnread && "bg-accent/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage 
                        src={thread.creator?.avatar || undefined} 
                        alt={thread.creator?.name || thread.creator?.username || 'User'} 
                      />
                      <AvatarFallback>
                        {(thread.creator?.name || thread.creator?.username || 'U')[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {isUnread ? (
                            <Circle className="h-3 w-3 fill-primary text-primary flex-shrink-0" />
                          ) : (
                            <MailOpen className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={cn(
                            "font-medium text-sm truncate", 
                            isUnread && "text-primary font-semibold"
                          )}>
                            {thread.subject}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDistanceToNow(new Date(thread.lastActivityAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {thread.preview || t('messages.noPreview')}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <p className="text-sm text-muted-foreground text-center">
              {getTranslation('messages.emptyFolder', 'No messages in this folder')}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ThreadList;