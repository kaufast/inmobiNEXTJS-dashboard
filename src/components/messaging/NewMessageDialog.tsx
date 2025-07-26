import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface User {
  id: number;
  username: string;
  fullName?: string;
}

const messageSchema = z.object({
  receiverId: z.string().min(1, 'Recipient is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Message is required'),
  messageType: z.enum(['direct', 'support', 'system']).default('direct'),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface NewMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (threadId: number) => void;
  initialRecipient?: User | null;
}

export const NewMessageDialog: React.FC<NewMessageDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  initialRecipient,
}) => {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch contacts for recipient dropdown
  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useQuery<User[]>({
    queryKey: ['messaging-contacts'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/messages/contacts');
        if (!res.ok) {
          throw new Error('Failed to fetch contacts');
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch contacts', error);
        return [];
      }
    },
    enabled: open,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set the default receiverId when a contact is provided
  const initialReceiverId = initialRecipient?.id?.toString() || '';
  
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      receiverId: initialReceiverId,
      subject: '',
      content: '',
      messageType: 'direct',
    },
  });
  
  // Update form value when initialRecipient changes
  useEffect(() => {
    if (initialRecipient?.id) {
      form.setValue('receiverId', initialRecipient.id.toString());
    }
  }, [initialRecipient, form]);

  const createMessageMutation = useMutation({
    mutationFn: async (values: MessageFormValues) => {
      const response = await apiRequest('POST', '/api/messages/threads', {
        receiverId: parseInt(values.receiverId),
        subject: values.subject,
        content: values.content,
        messageType: values.messageType,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitting(false);
      form.reset();
      onOpenChange(false);
      toast({
        title: t('dashboard.messages.sendSuccess'),
        description: t('dashboard.messages.messageHasBeenSent'),
      });

      // Refresh thread lists
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'folder-counts'] });

      if (onSuccess && data.thread) {
        onSuccess(data.thread.id);
      }
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      toast({
        title: t('dashboard.messages.sendError'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: MessageFormValues) => {
    setIsSubmitting(true);
    createMessageMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{t('dashboard.messages.newMessage')}</DialogTitle>
          <DialogDescription>
            {t('dashboard.messages.newMessageDescription')}
          </DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="receiverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dashboard.messages.recipient')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting || isLoadingUsers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          isLoadingUsers 
                            ? "Loading users..." 
                            : t('dashboard.messages.selectRecipient')
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <SelectItem value="loading" disabled>
                          Loading users...
                        </SelectItem>
                      ) : Array.isArray(users) && users.length > 0 ? (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName || user.username}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-users" disabled>
                          {usersError ? "Error loading users" : "No users available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dashboard.messages.subject')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('dashboard.messages.subjectPlaceholder')}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="messageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dashboard.messages.messageType')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('dashboard.messages.selectMessageType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="direct">{t('dashboard.messages.types.direct')}</SelectItem>
                      <SelectItem value="support">{t('dashboard.messages.types.support')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dashboard.messages.content')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('dashboard.messages.contentPlaceholder')}
                      disabled={isSubmitting}
                      className="min-h-[150px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('dashboard.messages.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('dashboard.messages.sending') : t('dashboard.messages.send')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewMessageDialog;