import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { InboxIcon, SendIcon, FileEditIcon, TrashIcon } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';

export type MessageFolder = 'inbox' | 'sent' | 'drafts' | 'trash';

interface FolderCounts {
  inbox: number;
  sent: number;
  drafts: number;
  trash: number;
}

interface UnreadCounts {
  inbox: number;
}

interface MessageFoldersProps {
  selectedFolder: MessageFolder;
  onSelectFolder: (folder: MessageFolder) => void;
}

export const MessageFolders: React.FC<MessageFoldersProps> = ({ 
  selectedFolder, 
  onSelectFolder 
}) => {
  const { t } = useTranslation('common');
  
  // Get folder counts (total messages in each folder)
  const { data: folderCounts = { inbox: 0, sent: 0, drafts: 0, trash: 0 } } = useQuery<FolderCounts>({
    queryKey: ['messages', 'folder-counts'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/messages/folder-counts');
        const data = await res.json();
        return data as FolderCounts;
      } catch (error) {
        console.error("Error fetching folder counts:", error);
        return { inbox: 0, sent: 0, drafts: 0, trash: 0 };
      }
    }
  });
  
  // Get unread message count
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ['messages', 'unread-count'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/messages/unread-count');
        const data = await res.json();
        return typeof data.count === 'number' ? data.count : 0;
      } catch (error) {
        console.error("Error fetching unread count:", error);
        return 0;
      }
    }
  });
  
  const unreadCounts: UnreadCounts = {
    inbox: unreadCount
  };
  
  const folders: Array<{
    id: MessageFolder;
    label: string;
    icon: React.ReactNode;
    count: number;
    unreadCount?: number;
  }> = [
    {
      id: 'inbox',
      label: t('dashboard.messages.inbox'),
      icon: <InboxIcon className="h-4 w-4" />,
      count: folderCounts.inbox,
      unreadCount: unreadCounts.inbox
    },
    {
      id: 'sent',
      label: t('dashboard.messages.sent'),
      icon: <SendIcon className="h-4 w-4" />,
      count: folderCounts.sent
    },
    {
      id: 'drafts',
      label: t('dashboard.messages.drafts'),
      icon: <FileEditIcon className="h-4 w-4" />,
      count: folderCounts.drafts
    },
    {
      id: 'trash',
      label: t('dashboard.messages.trash'),
      icon: <TrashIcon className="h-4 w-4" />,
      count: folderCounts.trash
    }
  ];

  return (
    <div className="flex flex-col space-y-1">
      {folders.map((folder) => (
        <TooltipProvider key={folder.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelectFolder(folder.id)}
                className={cn(
                  "flex items-center justify-between w-full rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  selectedFolder === folder.id && "bg-accent text-accent-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  {folder.icon}
                  <span className="hidden md:inline">{folder.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {folder.unreadCount && folder.unreadCount > 0 && (
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      {folder.unreadCount}
                    </Badge>
                  )}
                  {folder.count > 0 && !folder.unreadCount && (
                    <span className="text-xs text-muted-foreground">{folder.count}</span>
                  )}
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="md:hidden">
              {folder.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default MessageFolders;