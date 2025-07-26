import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, SendIcon, Bot, Home, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PropertyCard from '@/components/property/PropertyCard';

// Message type definition
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Use the Property type from shared schema
import { Property } from '@shared/schema';

export default function PropertyMatchingPage() {
  const { t } = useTranslation(['search']);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'assistant', 
      content: t('search.chatbot.welcomeMessage')
    }
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [matchedProperties, setMatchedProperties] = useState<Property[]>([]);

  // Auto scroll to bottom when new messages appear
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messages: ChatMessage[]) => {
      // Basic user preferences (can be extended later with actual user preferences)
      const userPreferences = user ? {
        userId: user.id,
        role: user.role
      } : undefined;
      
      const response = await apiRequest('POST', '/api/ai/property-matching/chat', {
        messages,
        userPreferences
      });
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Add assistant response to chat history
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      // If there are search parameters and we should search for properties
      if (data.searchParams) {
        searchProperties(data.searchParams);
      }
    },
    onError: (error) => {
      toast({
        title: t('notifications.error'),
        description: t('search.chatbot.error'),
        variant: 'destructive'
      });
      console.error('Error in chat request:', error);
    }
  });

  // Extract search parameters and find properties
  const extractParamsMutation = useMutation({
    mutationFn: async (messages: ChatMessage[]) => {
      const response = await apiRequest('POST', '/api/ai/property-matching/extract-params', {
        messages
      });
      
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.properties && data.properties.properties) {
        setMatchedProperties(data.properties.properties);
        setIsSearching(false);
        
        // Add a message about the found properties
        const count = data.properties.total || 0;
        const message = count > 0 
          ? t('search.chatbot.foundProperties', { count })
          : t('search.chatbot.noProperties');
        
        setChatHistory(prev => [...prev, { role: 'assistant', content: message }]);
      } else {
        setIsSearching(false);
        toast({
          title: t('notifications.notice'),
          description: t('search.chatbot.needMoreInfo'),
        });
      }
    },
    onError: (error) => {
      setIsSearching(false);
      toast({
        title: t('notifications.notice'),
        description: t('search.chatbot.searchError'),
        variant: 'destructive'
      });
      console.error('Error extracting search parameters:', error);
    }
  });

  // Handle sending message
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!userInput.trim()) return;
    
    // Add user message to chat history
    const newMessage: ChatMessage = { role: 'user', content: userInput };
    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);
    
    // Clear input field
    setUserInput('');
    
    // Send to AI
    sendMessageMutation.mutate(updatedHistory);
  };

  // Search for properties based on extracted parameters
  const searchProperties = (searchParams: any) => {
    setIsSearching(true);
    extractParamsMutation.mutate(chatHistory);
  };

  // Restart conversation
  const handleRestart = () => {
    setChatHistory([{
      role: 'assistant', 
      content: t('search.chatbot.welcomeMessage')
    }]);
    setMatchedProperties([]);
  };

  // Manual property search
  const handleManualSearch = () => {
    setIsSearching(true);
    extractParamsMutation.mutate(chatHistory);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button className="flex items-center gap-2 bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all">
            <ArrowLeft className="h-4 w-4" />
            {t('general.backToHome')}
          </Button>
        </Link>
        
        <Button 
          onClick={handleRestart} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t('search.chatbot.restart')}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat panel */}
        <Card className="lg:col-span-2 p-4 h-[calc(100vh-12rem)] flex flex-col overflow-hidden">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold tracking-tight">
              {t('search.chatbot.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('search.chatbot.subtitle')}
            </p>
          </div>
          
          <Separator className="my-2" />
          
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
            {chatHistory.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 
                    ${message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'}`}
                >
                  {message.role === 'assistant' && (
                    <Bot className="h-4 w-4 mb-1 text-muted-foreground inline-block mr-1" />
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {(sendMessageMutation.isPending) && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('search.chatbot.thinking')}</span>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>
          
          {/* Input form */}
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={t('search.chatbot.inputPlaceholder')}
              className="flex-1"
              disabled={sendMessageMutation.isPending}
            />
            <Button 
              type="submit" 
              disabled={sendMessageMutation.isPending || !userInput.trim()}
              className="bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
            >
              <SendIcon className="h-4 w-4" />
              <span className="sr-only">{t('search.actions.sendChat')}</span>
            </Button>
          </form>
          
          {/* Action buttons */}
          <div className="mt-4 flex justify-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManualSearch}
              disabled={isSearching || chatHistory.length < 2}
              className="flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('search.chatbot.searchingStatus')}
                </>
              ) : (
                t('search.chatbot.findPropertiesButton')
              )}
            </Button>
          </div>
        </Card>
        
        {/* Results panel */}
        <Card className="p-4 h-[calc(100vh-12rem)] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">
            {matchedProperties.length > 0 
              ? t('search.chatbot.matchedPropertiesTitle')
              : t('search.chatbot.noMatchesYetPlaceholder')}
          </h2>
          
          {isSearching ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>{t('search.chatbot.searchingPropertiesStatus')}</p>
            </div>
          ) : matchedProperties.length > 0 ? (
            <div className="space-y-4">
              {matchedProperties.map((property, index) => (
                <PropertyCard key={index} property={property} size="small" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Bot className="h-16 w-16 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">
                {t('search.chatbot.startConversationPlaceholder')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('search.chatbot.examplePromptsPlaceholder')}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}