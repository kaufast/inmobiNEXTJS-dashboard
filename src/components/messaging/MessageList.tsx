import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  threadId: number;
  senderId: number;
  content: string;
  createdAt: string;
  sender?: {
    id: number;
    username: string;
    name?: string;
    email: string;
    avatar?: string;
  };
}

interface MessageListProps {
  threadId: number | null;
  currentUserId: number;
}

export const MessageList: React.FC<MessageListProps> = ({ threadId, currentUserId }) => {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [hasNetworkError, setHasNetworkError] = React.useState(false);
  
  const { 
    data: messages, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ['message-threads', threadId, 'messages'],
    queryFn: async () => {
      if (!threadId) return [];
      try {
        setHasNetworkError(false);
        const res = await apiRequest('GET', `/api/messages/threads/${threadId}/messages`);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching messages for thread:", error);
        setHasNetworkError(true);
        throw error; // Let React Query handle the error state
      }
    },
    enabled: !!threadId,
    retry: 2, // Automatically retry failed requests twice
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    onError: (err) => {
      // Log the error but don't show toast as we'll show an inline error
      console.error('Failed to load messages:', err);
    }
  });
  
  // Scroll to the bottom when messages change
  React.useEffect(() => {
    if (scrollRef.current && messages?.length) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

  // Handle manual retry
  const handleRetry = React.useCallback(() => {
    toast({
      description: t('dashboard.messages.retrying'),
    });
    refetch();
  }, [refetch, toast, t]);

  if (!threadId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
        <p>{t('dashboard.messages.selectConversation')}</p>
      </div>
    );
  }

  if (isLoading || isRefetching) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">{t('dashboard.messages.loading')}</p>
      </div>
    );
  }

  if (isError || hasNetworkError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('dashboard.messages.errorLoading')}</AlertTitle>
          <AlertDescription>
            {t('dashboard.messages.errorLoadingDescription')}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRetry} className="mt-2 flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('dashboard.messages.retry')}
        </Button>
      </div>
    );
  }

  if (!messages?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
        <p>{t('dashboard.messages.noMessages')}</p>
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender?.avatar} />
                  <AvatarFallback>
                    {message.sender?.name?.[0] || message.sender?.username?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <Card className={`${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  <CardContent className="p-3">
                    <div className="flex flex-col">
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default MessageList;