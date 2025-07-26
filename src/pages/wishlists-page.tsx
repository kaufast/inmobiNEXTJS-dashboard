import { useState } from "react";
import { useLocation } from "wouter";
import { useWishlists } from "@/hooks/use-wishlists";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Switch 
} from "@/components/ui/switch";
import { 
  Skeleton 
} from "@/components/ui/skeleton";
import { 
  PlusCircle, 
  Home, 
  Users, 
  Calendar, 
  Star, 
  Heart, 
  Eye, 
  Bookmark, 
  Settings, 
  Loader2, 
  Share2, 
  ExternalLink,
  Check,
  Copy
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Define interfaces for wishlist data
interface WishlistData {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  isPublic: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  memberCount?: number;
  coverImage?: string;
}

interface WishlistInvitation {
  id: number;
  wishlist: WishlistData;
  inviter?: {
    id: number;
    name: string;
  };
}

// Define the form schema with zod
const createWishlistSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(100),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

type CreateWishlistFormValues = z.infer<typeof createWishlistSchema>;

export default function WishlistsPage() {
  const { t } = useTranslation('common');
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { 
    wishlists, 
    isLoadingWishlists, 
    createWishlist, 
    isCreatingWishlist,
    deleteWishlist,
    isDeletingWishlist,
    invitedWishlists,
    isLoadingInvitedWishlists,
    acceptInvitation,
    isAcceptingInvitation,
    declineInvitation,
    isDecliningInvitation
  } = useWishlists();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'mine' | 'shared'>('all');
  
  // Set up form with react-hook-form and zod validation
  const form = useForm<CreateWishlistFormValues>({
    resolver: zodResolver(createWishlistSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
    },
  });

  // Handle form submission to create a new wishlist
  const onSubmit = (data: CreateWishlistFormValues) => {
    createWishlist(data.name, data.description || null, data.isPublic);
    setCreateDialogOpen(false);
    form.reset();
  };

  // Reset form when dialog is opened
  const handleOpenChange = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      form.reset();
    }
  };

  // Filter wishlists based on view mode
  const filteredWishlists = wishlists.filter(wishlist => {
    if (viewMode === 'all') return true;
    if (viewMode === 'mine') return wishlist.ownerId === user?.id;
    // 'shared' mode - wishlists where user is a member but not the owner
    if (viewMode === 'shared') return wishlist.ownerId !== user?.id;
    return true;
  });

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('wishlist.wishlists')}</h1>
          <p className="text-muted-foreground">{t('wishlist.wishlists_description')}</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('wishlist.create_wishlist')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('wishlist.create_new_wishlist')}</DialogTitle>
              <DialogDescription>
                {t('wishlist.create_description')}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('wishlist.name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('wishlist.name_placeholder')} {...field} />
                      </FormControl>
                      <FormDescription>
                        {t('wishlist.name_description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('wishlist.description')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('wishlist.description_placeholder')} 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('wishlist.description_desc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t('wishlist.public')}
                        </FormLabel>
                        <FormDescription>
                          {t('wishlist.public_description')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={isCreatingWishlist}>
                    {isCreatingWishlist ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="mr-2 h-4 w-4" />
                    )}
                    {t('wishlist.create')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* View mode tabs */}
      <Tabs 
        defaultValue="all" 
        value={viewMode} 
        onValueChange={(value) => setViewMode(value as 'all' | 'mine' | 'shared')}
        className="mb-8"
      >
        <TabsList>
          <TabsTrigger value="all">
            <Bookmark className="h-4 w-4 mr-2" />
            {t('wishlist.all_wishlists')}
          </TabsTrigger>
          <TabsTrigger value="mine">
            <Heart className="h-4 w-4 mr-2" />
            {t('wishlist.my_wishlists')}
          </TabsTrigger>
          <TabsTrigger value="shared">
            <Users className="h-4 w-4 mr-2" />
            {t('wishlist.shared_with_me')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Invited wishlists section */}
      {invitedWishlists.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {t('wishlist.invitations')}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {invitedWishlists.map((invitation) => (
              <Card key={invitation.id} className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {invitation.wishlist.name}
                  </CardTitle>
                  <CardDescription>
                    {t('wishlist.invited_by', { name: invitation.inviter?.name || 'Unknown user' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {invitation.wishlist.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {invitation.wishlist.description}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 pt-0">
                  <Button
                    variant="outline"
                    onClick={() => declineInvitation(invitation.id)}
                    disabled={isDecliningInvitation}
                  >
                    {t('decline')}
                  </Button>
                  <Button
                    onClick={() => acceptInvitation(invitation.id)}
                    disabled={isAcceptingInvitation}
                  >
                    {isAcceptingInvitation ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    {t('accept')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Wishlists grid */}
      {isLoadingWishlists ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-40">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-9 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredWishlists.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">
            {t('wishlist.no_wishlists_found')}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {viewMode === 'all' 
              ? t('wishlist.create_first_wishlist') 
              : viewMode === 'mine' 
                ? t('wishlist.create_own_wishlist')
                : t('wishlist.no_shared_wishlists')}
          </p>
          {(viewMode === 'all' || viewMode === 'mine') && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('wishlist.create_wishlist')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWishlists.map((wishlist) => (
            <Card key={wishlist.id} className="overflow-hidden">
              <div 
                className="h-40 bg-gradient-to-br from-primary/5 to-primary/20 relative cursor-pointer"
                onClick={() => navigate(`/wishlists/${wishlist.id}`)}
              >
                {wishlist.coverImage ? (
                  <img 
                    src={wishlist.coverImage} 
                    alt={wishlist.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Heart className="h-12 w-12 text-primary/40" />
                  </div>
                )}
                
                {wishlist.ownerId !== user?.id && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {t('wishlist.shared')}
                    </div>
                  </div>
                )}
                
                {wishlist.isPublic && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-primary/70 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {t('wishlist.public')}
                    </div>
                  </div>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="truncate">{wishlist.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {wishlist.memberCount || 1} {t('wishlist.members')}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {wishlist.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {wishlist.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {t('wishlist.no_description')}
                  </p>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <div className="text-xs text-muted-foreground">
                  {t('wishlist.created', { 
                    timeAgo: formatDistanceToNow(new Date(wishlist.createdAt), { addSuffix: true }) 
                  })}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/wishlists/${wishlist.id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  {t('view')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}