import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenIcon, PlusIcon, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import MessageFolders, { MessageFolder } from './MessageFolders';
import ThreadList from './ThreadList';
import NewMessageDialog from './NewMessageDialog';
import { FavoriteContactsList } from './FavoriteContactsList';
import { User } from '@shared/schema';
import { ReportIssueButton } from '@/components/common/ReportIssueButton';

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

const MessagingDashboard: React.FC = () => {
  const { t, ready } = useTranslation('dashboard');
  const { user } = useAuth();
  const [selectedFolder, setSelectedFolder] = useState<MessageFolder>('inbox');
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'folders' | 'favorites'>('folders');
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  
  // Removed hardcoded texts - using direct t() calls now
  
  // Handle selecting a folder
  const handleFolderSelect = (folder: MessageFolder) => {
    setSelectedFolder(folder);
    setSelectedThread(null);
  };
  
  // Handle selecting a thread
  const handleThreadSelect = (thread: Thread) => {
    setSelectedThread(thread);
  };
  
  // Handle creating a new message
  const handleNewMessage = (contact?: User) => {
    if (contact) {
      setSelectedContact(contact);
    } else {
      setSelectedContact(null);
    }
    setIsNewMessageOpen(true);
  };
  
  // Handle new message success (select the newly created thread)
  const handleNewMessageSuccess = (threadId: number) => {
    // We would ideally fetch the thread here, but for now we'll just select it
    // in the next render cycle when the thread list is refreshed
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>{t('dashboard.messages.pleaseLogin')}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Compose Button */}
      <div className="px-4 py-3 border-b flex justify-between items-center bg-background">
        <h1 className="text-xl font-bold">{t('messages.title', 'Messages')}</h1>
        <div className="flex items-center gap-2">
          <ReportIssueButton context="messages" variant="outline" />
          <Button 
            onClick={() => handleNewMessage()} 
            variant="default" 
            size="sm"
            className="flex items-center gap-2 bg-black text-white hover:bg-white hover:text-black border border-black"
          >
            <PlusIcon className="h-4 w-4" />
            {t('dashboard.messages.compose')}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Folders/Favorites panel */}
          <ResizablePanel defaultSize={15} minSize={10} maxSize={20}>
            <div className="h-full">
              <Tabs 
                defaultValue="folders" 
                value={sidebarTab} 
                onValueChange={(value) => setSidebarTab(value as 'folders' | 'favorites')}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-2 mx-2 mt-2">
                  <TabsTrigger value="folders" className="text-xs">
                    {t('dashboard.messages.inbox')}
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="text-xs flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {t('dashboard.messages.favoriteContacts')}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="folders" className="p-2 pt-0">
                  <MessageFolders
                    selectedFolder={selectedFolder}
                    onSelectFolder={handleFolderSelect}
                  />
                </TabsContent>
                
                <TabsContent value="favorites" className="pt-0">
                  <FavoriteContactsList 
                    showControls={true}
                    onSelectContact={(contact) => {
                      // Create new message with this contact as recipient
                      handleNewMessage(contact);
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Threads panel */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            <ThreadList
              selectedFolder={selectedFolder}
              selectedThreadId={selectedThread?.id || null}
              onSelectThread={handleThreadSelect}
              onNewMessage={handleNewMessage}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Messages panel */}
          <ResizablePanel defaultSize={55}>
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-hidden">
                <MessageList
                  threadId={selectedThread?.id || null}
                  currentUserId={user.id}
                />
              </div>
              
              <Separator />
              
              <MessageComposer
                threadId={selectedThread?.id || null}
                disabled={!selectedThread}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      <NewMessageDialog
        open={isNewMessageOpen}
        onOpenChange={(open) => {
          setIsNewMessageOpen(open);
          if (!open) setSelectedContact(null);
        }}
        onSuccess={handleNewMessageSuccess}
        initialRecipient={selectedContact}
      />
    </div>
  );
};

export default MessagingDashboard;