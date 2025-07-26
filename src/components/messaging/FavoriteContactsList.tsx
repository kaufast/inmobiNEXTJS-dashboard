import { useState } from 'react';
import { useMessageFavorites } from '@/hooks/use-message-favorites';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from 'react-i18next';
import { User } from '@shared/schema';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, StarOff, Search, X, MessageSquare } from 'lucide-react';

interface FavoriteContactsListProps {
  onSelectContact?: (user: User) => void;
  showControls?: boolean;
}

export function FavoriteContactsList({ 
  onSelectContact, 
  showControls = true 
}: FavoriteContactsListProps) {
  const { t, ready } = useTranslation('dashboard');
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    favoriteUsers, 
    isLoadingFavorites,
    removeFromFavorites,
    isRemovingFavorite
  } = useMessageFavorites();
  
  // Helper function to get translation with fallback
  const getTranslation = (key: string, fallback: string) => {
    // Temporarily return hardcoded text to debug translation issues
    const hardcodedTexts: Record<string, string> = {
      'messages.favoriteContacts': 'Favourite Contacts',
      'messages.loading': 'Loading...',
      'messages.noFavorites': 'No favourite contacts yet',
      'messages.noFavoritesDescription': 'Your favourite contacts will appear here',
      'messages.searchFavorites': 'Search your favourite contacts',
      'messages.noMatchingFavorites': 'No contacts matching your search',
      'messages.agent': 'Agent',
      'messages.user': 'User',
      'messages.sendMessage': 'Send Message',
      'messages.removeFromFavorites': 'Remove from Favourites'
    };
    
    return hardcodedTexts[key] || fallback;
  };
  
  // Filter favorite users based on search query
  const filteredFavorites = searchQuery.trim() === '' 
    ? favoriteUsers 
    : favoriteUsers.filter(fav => 
        fav.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fav.email && fav.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (fav.fullName && fav.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  
  // Generate initials for avatar fallback
  const getInitials = (user: User) => {
    if (user.fullName) {
      return user.fullName.split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user.username.substring(0, 2).toUpperCase();
  };
  
  // Get display name
  const getDisplayName = (user: User) => {
    return user.fullName || user.username;
  };
  
  if (isLoadingFavorites) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getTranslation('messages.favoriteContacts', 'Favourite Contacts')}</CardTitle>
          <CardDescription>
            {getTranslation('messages.loading', 'Loading...')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (favoriteUsers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getTranslation('messages.favoriteContacts', 'Favourite Contacts')}</CardTitle>
          <CardDescription>
            {getTranslation('messages.noFavorites', 'No favourite contacts yet')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <Star className="mb-2 h-12 w-12 opacity-20" />
            <p>{getTranslation('messages.noFavoritesDescription', 'Your favourite contacts will appear here')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTranslation('messages.favoriteContacts', 'Favourite Contacts')}</CardTitle>
        <CardDescription>
          {getTranslation('messages.favoriteContacts', 'Favourite Contacts')}
        </CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={getTranslation('messages.searchFavorites', 'Search your favourite contacts')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-10 w-10"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredFavorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <p>{getTranslation('messages.noMatchingFavorites', 'No contacts matching your search')}</p>
          </div>
        ) : (
          <ScrollArea className="h-[50vh] pr-4">
            <div className="space-y-4">
              {filteredFavorites.map(favoriteUser => (
                <div
                  key={favoriteUser.id}
                  className="flex items-start justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div 
                    className="flex items-center space-x-4 cursor-pointer"
                    onClick={() => onSelectContact && onSelectContact(favoriteUser)}
                  >
                    <Avatar>
                      <AvatarImage src={favoriteUser.avatar || ''} alt={getDisplayName(favoriteUser)} />
                      <AvatarFallback>{getInitials(favoriteUser)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{getDisplayName(favoriteUser)}</div>
                      <div className="text-sm text-muted-foreground">
                        {favoriteUser.role === 'agent' ? getTranslation('messages.agent', 'Agent') : getTranslation('messages.user', 'User')}
                      </div>
                    </div>
                  </div>
                  
                  {showControls && (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onSelectContact && onSelectContact(favoriteUser)}
                        title={getTranslation('messages.sendMessage', 'Send Message')}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-100"
                        onClick={() => removeFromFavorites(favoriteUser.id)}
                        disabled={isRemovingFavorite}
                        title={getTranslation('messages.removeFromFavorites', 'Remove from Favourites')}
                      >
                        <StarOff className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}