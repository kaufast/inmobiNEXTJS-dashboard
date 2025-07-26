import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Search, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import PropertyCard from '@/components/property/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { usePropertyMatchingChat, type ChatMessage } from '@/hooks/use-chat-conversation';
import { Property } from '@shared/schema';

export function PropertyMatchingChat() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I can help you find the perfect property. Tell me what you\'re looking for in your dream home.'
    }
  ]);
  const { searchResults, sendChat, isSending, clearSearchResults } = usePropertyMatchingChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || isSending) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Send to API and get response
    try {
      // Clear previous search results
      clearSearchResults();
      
      // Show a thinking indicator
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '...',
        id: -1 // temporary id for the thinking indicator
      }]);
      
      // Send the message to the API
      const result = await sendChat([...messages, userMessage], {
        preferredLanguage: localStorage.getItem('i18nextLng') || 'en-US'
      });
      
      // Replace thinking indicator with actual response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== -1);
        return [...filtered, {
          role: 'assistant',
          content: result.message || result.response,
          searchParams: result.searchParams
        }];
      });
      
    } catch (error) {
      console.error('Error in chat:', error);
      
      // Remove thinking indicator and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== -1);
        return [...filtered, {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.'
        }];
      });
    }
  };
  
  return (
    <Card className="w-full h-[700px] max-h-[80vh] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <Bot className="w-5 h-5 mr-2" />
          Property Matching Assistant
        </CardTitle>
      </CardHeader>
      
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 py-4">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[80%] rounded-lg px-4 py-2
                  ${message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                  }
                `}
              >
                <div className="flex items-center mb-1">
                  {message.role === 'user' ? (
                    <>
                      <span className="font-medium mr-2">You</span>
                      <User className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      <span className="font-medium mr-2">Assistant</span>
                      <Bot className="h-3 w-3" />
                    </>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {searchResults && searchResults.properties && searchResults.properties.length > 0 && (
        <>
          <Separator />
          <div className="p-4">
            <h3 className="flex items-center mb-3 font-semibold">
              <Search className="w-4 h-4 mr-2" />
              Found {searchResults.properties.length} properties matching your criteria
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {searchResults.properties.map((property: Property) => (
                <PropertyCard 
                  key={property.id}
                  property={property}
                  className="h-auto"
                  variant="simple"
                  showActions={false}
                />
              ))}
            </div>
          </div>
        </>
      )}
      
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isSending || !inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

export function PropertyMatchingChatSkeleton() {
  return (
    <Card className="w-full h-[700px] max-h-[80vh] flex flex-col">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-56" />
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-16 w-2/3 ml-auto" />
          <Skeleton className="h-24 w-3/4" />
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
        </div>
      </CardFooter>
    </Card>
  );
}