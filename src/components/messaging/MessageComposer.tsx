import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PaperclipIcon, SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface MessageComposerProps {
  threadId: number | null;
  disabled?: boolean;
  onMessageSent?: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ 
  threadId, 
  disabled = false,
  onMessageSent
}) => {
  const { t } = useTranslation('common');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Handle text area auto resize
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);
  
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!threadId) throw new Error('No thread selected');
      if (!content.trim()) throw new Error('Message cannot be empty');
      
      const response = await apiRequest('POST', `/api/messages/threads/${threadId}/messages`, {
        content: content.trim()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setContent('');
      setIsSubmitting(false);
      // Invalidate queries to refresh the message list
      queryClient.invalidateQueries({ queryKey: ['message-threads', threadId, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'folder-counts'] });
      
      if (onMessageSent) {
        onMessageSent();
      }
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      toast({
        title: t('dashboard.messages.sendError'),
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isSubmitting || !content.trim() || !threadId) return;
    
    setIsSubmitting(true);
    sendMessageMutation.mutate();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <form 
      onSubmit={handleSendMessage} 
      className={cn("border-t border-border p-4 transition-opacity", {
        "opacity-50 pointer-events-none": disabled || !threadId
      })}
    >
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={threadId ? t('dashboard.messages.typeMessage') : t('dashboard.messages.selectConversationToSend')}
          className="min-h-[60px] resize-none"
          disabled={disabled || !threadId}
        />
        <div className="flex gap-2">
          {/* Attachment button - currently disabled, will be implemented in future */}
          <Button
            size="icon"
            variant="outline"
            type="button"
            disabled={true}
            className="flex-shrink-0"
            title={t('dashboard.messages.attachments')}
          >
            <PaperclipIcon className="h-4 w-4" />
          </Button>
          
          <Button 
            size="icon"
            type="submit"
            disabled={disabled || isSubmitting || !content.trim() || !threadId}
            className="flex-shrink-0"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        {t('dashboard.messages.sendHint')}
      </div>
    </form>
  );
};

export default MessageComposer;