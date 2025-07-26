import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useWishlistDetails, useWishlistItemInteractions } from "@/hooks/use-wishlists";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator"; 
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Loader2,
  Home,
  Users,
  ListFilter,
  Star,
  PlusCircle,
  MessageSquare,
  Bookmark,
  ChevronLeft,
  Heart,
  X,
  Edit2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Eye,
  Check,
  Phone
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

// Define types for property-related data
type StatusType = 'considering' | 'interested' | 'contacted' | 'viewed' | 'rejected';

interface PropertyData {
  id: number;
  title: string;
  price: number;
  city: string;
  country: string;
  description: string;
  images?: string[];
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  listingType: string;
  contactPhone?: string;
}

interface WishlistItem {
  id: number;
  property: PropertyData;
  notes?: string;
  status?: StatusType;
  priority?: number;
  addedAt: string | Date;
}

// Status badges with colors
const STATUS_BADGES: Record<StatusType, { color: string; label: string }> = {
  considering: { color: "bg-blue-100 text-blue-800", label: "Considering" },
  interested: { color: "bg-green-100 text-green-800", label: "Interested" },
  contacted: { color: "bg-purple-100 text-purple-800", label: "Contacted" },
  viewed: { color: "bg-yellow-100 text-yellow-800", label: "Viewed" },
  rejected: { color: "bg-red-100 text-red-800", label: "Rejected" }
};

interface PropertyCardProps {
  item: WishlistItem;
  onUpdateStatus: (status: string) => void;
  onUpdatePriority: (priority: number) => void;
  onRemove: () => void;
  canEdit: boolean;
  onView: () => void;
}

function PropertyCard({ item, onUpdateStatus, onUpdatePriority, onRemove, canEdit, onView }: PropertyCardProps) {
  const { t } = useTranslation(['properties', 'common']);
  const { property, notes, status, priority, addedAt } = item;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const statusInfo = STATUS_BADGES[(status as StatusType) || 'considering'];

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={property.images?.[0] || '/images/apartment-interior.jpg'} 
          alt={property.title} 
          className="w-full h-full object-cover"
          onClick={onView}
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          <Badge variant="secondary" className={statusInfo.color}>
            {t(`property.status.${status || 'considering'}`)}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="bg-black/70 text-white">
            ${property.price.toLocaleString()}
          </Badge>
        </div>
        {canEdit && (
          <div className="absolute top-2 left-2 flex space-x-1">
            <Select 
              value={status || 'considering'}
              onValueChange={onUpdateStatus}
            >
              <SelectTrigger className="w-10 h-10 p-0 bg-white/90 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="considering">{t('status.considering')}</SelectItem>
                <SelectItem value="interested">{t('status.interested')}</SelectItem>
                <SelectItem value="contacted">{t('status.contacted')}</SelectItem>
                <SelectItem value="viewed">{t('status.viewed')}</SelectItem>
                <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg truncate">{property.title}</CardTitle>
          {canEdit && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('wishlist.update_item')}</DialogTitle>
                  <DialogDescription>
                    {property.title}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t('wishlist.status')}</Label>
                    <Select 
                      value={status || 'considering'}
                      onValueChange={onUpdateStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="considering">{t('status.considering')}</SelectItem>
                        <SelectItem value="interested">{t('status.interested')}</SelectItem>
                        <SelectItem value="contacted">{t('status.contacted')}</SelectItem>
                        <SelectItem value="viewed">{t('status.viewed')}</SelectItem>
                        <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('wishlist.priority')}</Label>
                    <Select 
                      value={String(priority || 0)}
                      onValueChange={(val) => onUpdatePriority(parseInt(val))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">{t('wishlist.priority_0')}</SelectItem>
                        <SelectItem value="1">{t('wishlist.priority_1')}</SelectItem>
                        <SelectItem value="2">{t('wishlist.priority_2')}</SelectItem>
                        <SelectItem value="3">{t('wishlist.priority_3')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="destructive" onClick={onRemove}>
                    {t('remove')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <CardDescription className="flex justify-between">
          <span>{property.city}, {property.country}</span>
          <div className="space-x-1 text-xs">
            {Array.from({ length: priority || 0 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 inline text-amber-500" />
            ))}
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3">
          {property.description}
        </p>
        {notes && (
          <div className="mt-3 p-2 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              {t('wishlist.notes')}:
            </p>
            <p className="text-sm">{notes}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-3 flex justify-between">
        <div className="text-xs text-muted-foreground">
          {t('wishlist.added', { 
            timeAgo: formatDistanceToNow(new Date(addedAt), { addSuffix: true }) 
          })}
        </div>
        <Button variant="ghost" size="sm" onClick={onView}>
          <Eye className="h-4 w-4 mr-1" /> {t('propertyCard.viewDetails')}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  createdAt: string | Date;
}

interface Rating {
  user: {
    id: number;
  };
  rating: number;
}

interface CommentSectionProps {
  itemId: number;
  wishlistId: number;
}

function CommentSection({ itemId, wishlistId }: CommentSectionProps) {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { 
    comments, 
    isLoadingComments, 
    addComment, 
    isAddingComment,
    deleteComment,
    ratings,
    isLoadingRatings,
    addRating,
    isAddingRating,
    averageRating
  } = useWishlistItemInteractions(wishlistId, itemId);
  
  const [commentText, setCommentText] = useState('');
  
  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment(commentText.trim());
      setCommentText('');
    }
  };
  
  const userRating = ratings.find(r => r.user.id === user?.id)?.rating || 0;
  
  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">{t('wishlist.your_rating')}</h3>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              variant="ghost"
              size="sm"
              className={`p-1 ${userRating >= star ? 'text-amber-500' : 'text-muted-foreground'}`}
              onClick={() => addRating(star)}
              disabled={isAddingRating}
            >
              <Star className="h-6 w-6" />
            </Button>
          ))}
        </div>
        {ratings.length > 0 && (
          <div className="mt-3">
            <p className="text-sm">
              {t('wishlist.average_rating')}: 
              <span className="font-medium ml-1">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-muted-foreground text-xs ml-1">
                ({ratings.length} {ratings.length === 1 ? t('wishlist.rating') : t('wishlist.ratings')})
              </span>
            </p>
          </div>
        )}
      </div>
      
      <div className="border rounded-lg">
        <div className="p-3 border-b">
          <h3 className="font-medium">{t('wishlist.comments')}</h3>
        </div>
        
        <ScrollArea className="h-64">
          {isLoadingComments ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-60" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MessageSquare className="mx-auto h-8 w-8 mb-2" />
              <p>{t('wishlist.no_comments')}</p>
            </div>
          ) : (
            <div className="p-3 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar>
                    <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                    <AvatarFallback>{comment.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{comment.user.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  {user?.id === comment.user.id && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t">
          <div className="flex space-x-2">
            <Textarea
              placeholder={t('wishlist.write_comment')}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-10"
            />
            <Button 
              onClick={handleAddComment} 
              disabled={!commentText.trim() || isAddingComment}
            >
              {isAddingComment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('common.post')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface WishlistMember {
  id: number;
  userId: number;
  role: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface MembersListProps {
  members: WishlistMember[];
  wishlistOwnerId: number;
  onUpdateRole: (userId: number, role: string) => void;
  onRemoveMember: (userId: number) => void;
  currentUserId: number;
}

function MembersList({ members, wishlistOwnerId, onUpdateRole, onRemoveMember, currentUserId }: MembersListProps) {
  const { t } = useTranslation('common');
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-amber-100 text-amber-800">{t('wishlist.role.owner')}</Badge>;
      case 'member':
        return <Badge className="bg-blue-100 text-blue-800">{t('wishlist.role.member')}</Badge>;
      case 'viewer':
        return <Badge className="bg-gray-100 text-gray-800">{t('wishlist.role.viewer')}</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="border rounded-lg">
      <div className="p-3 border-b">
        <h3 className="font-medium">{t('wishlist.members')}</h3>
      </div>
      
      <div className="divide-y">
        {members.map((member) => (
          <div key={member.id} className="p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={member.user.avatar} alt={member.user.name} />
                <AvatarFallback>{member.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.user.name}</p>
                <p className="text-sm text-muted-foreground">{member.user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getRoleBadge(member.role)}
              
              {currentUserId === wishlistOwnerId && member.user.id !== currentUserId && (
                <>
                  <Select
                    value={member.role}
                    onValueChange={(role) => onUpdateRole(member.userId, role)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">{t('wishlist.role.owner')}</SelectItem>
                      <SelectItem value="member">{t('wishlist.role.member')}</SelectItem>
                      <SelectItem value="viewer">{t('wishlist.role.viewer')}</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveMember(member.userId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WishlistDetailPage() {
  const { t } = useTranslation('common');
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const wishlistId = params.id ? parseInt(params.id) : null;
  
  const {
    wishlist,
    isLoadingWishlist,
    wishlistError,
    members,
    isLoadingMembers,
    items,
    isLoadingItems,
    addMember,
    isAddingMember,
    updateMemberRole,
    isUpdatingMemberRole,
    removeMember,
    isRemovingMember,
    updateItem,
    isUpdatingItem,
    removeItem,
    isRemovingItem
  } = useWishlistDetails(wishlistId);
  
  const [activeTab, setActiveTab] = useState("properties");
  const [sortOption, setSortOption] = useState("priority");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newMemberUsername, setNewMemberUsername] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  
  // Check if current user is a member
  const isMember = members.some(member => member.user.id === user?.id);
  
  // Check if current user is the owner
  const isOwner = wishlist?.ownerId === user?.id;
  
  // Check if current user can edit items (owner or member)
  const canEditItems = isOwner || members.some(m => m.user.id === user?.id && m.role !== 'viewer');
  
  // Filter and sort items
  const filteredItems = items.filter(item => {
    if (statusFilter === "all") return true;
    return item.status === statusFilter;
  });
  
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOption === "price") {
      return a.property.price - b.property.price;
    } else if (sortOption === "priority") {
      return (b.priority || 0) - (a.priority || 0);
    } else if (sortOption === "added") {
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    }
    return 0;
  });
  
  const handleAddMember = () => {
    if (newMemberUsername) {
      addMember(newMemberUsername, newMemberRole as any);
      setNewMemberUsername("");
      setNewMemberRole("member");
      setIsAddMemberDialogOpen(false);
    }
  };
  
  // If not authenticated
  if (!user) {
    return (
      <div className="container mx-auto mt-8 px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">{t("wishlist.login_required")}</h2>
          <p className="mt-2 text-muted-foreground">{t("wishlist.login_message")}</p>
          <Button className="mt-4" onClick={() => setLocation("/auth")}>
            {t("common.login")}
          </Button>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (isLoadingWishlist || isLoadingMembers || isLoadingItems) {
    return (
      <div className="container mx-auto mt-8 px-4">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  // Show error state
  if (wishlistError || !wishlist) {
    return (
      <div className="container mx-auto mt-8 px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-destructive">{t("wishlist.not_found")}</h2>
          <p className="mt-2 text-muted-foreground">{t("wishlist.not_found_description")}</p>
          <Button className="mt-4" onClick={() => setLocation("/wishlists")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("common.back_to_list")}
          </Button>
        </div>
      </div>
    );
  }
  
  // Check access
  if (!isOwner && !isMember && !wishlist.isPublic) {
    return (
      <div className="container mx-auto mt-8 px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-destructive">{t("wishlist.no_access")}</h2>
          <p className="mt-2 text-muted-foreground">{t("wishlist.no_access_description")}</p>
          <Button className="mt-4" onClick={() => setLocation("/wishlists")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("common.back_to_list")}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto mt-8 pb-12 px-4">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => setLocation("/wishlists")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t("common.back_to_list")}
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            {wishlist.name}
            {wishlist.isPublic ? (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                {t("wishlist.public")}
              </Badge>
            ) : (
              <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-800">
                {t("wishlist.private")}
              </Badge>
            )}
          </h1>
          
          {wishlist.description && (
            <p className="mt-2 text-muted-foreground max-w-2xl">{wishlist.description}</p>
          )}
          
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <span>
              {t("wishlist.created_at", { 
                timeAgo: formatDistanceToNow(new Date(wishlist.createdAt), { addSuffix: true }) 
              })}
            </span>
            <span className="mx-2">•</span>
            <span>
              {t("wishlist.updated_at", { 
                timeAgo: formatDistanceToNow(new Date(wishlist.updatedAt), { addSuffix: true }) 
              })}
            </span>
            <span className="mx-2">•</span>
            <span className="flex items-center">
              <Users className="mr-1 h-4 w-4" />
              {members.length} {members.length === 1 ? t("wishlist.member") : t("wishlist.members")}
            </span>
          </div>
        </div>
        
        {isOwner && (
          <div className="flex space-x-2">
            <Button asChild>
              <a href={`/wishlists/${wishlist.id}/edit`}>
                <Edit2 className="mr-2 h-4 w-4" />
                {t("wishlist.edit")}
              </a>
            </Button>
            
            <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  {t("wishlist.add_member")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("wishlist.add_member_title")}</DialogTitle>
                  <DialogDescription>
                    {t("wishlist.add_member_description")}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">{t("wishlist.username")}</Label>
                    <Input 
                      id="username" 
                      value={newMemberUsername} 
                      onChange={(e) => setNewMemberUsername(e.target.value)}
                      placeholder={t("wishlist.username_placeholder")}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="role">{t("wishlist.role.title")}</Label>
                    <Select 
                      value={newMemberRole} 
                      onValueChange={(value) => setNewMemberRole(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("wishlist.role.select")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">{t("wishlist.role.member")}</SelectItem>
                        <SelectItem value="viewer">{t("wishlist.role.viewer")}</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {newMemberRole === "member" 
                        ? t("wishlist.role.member_description") 
                        : t("wishlist.role.viewer_description")}
                    </p>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button 
                    onClick={handleAddMember} 
                    disabled={!newMemberUsername || isAddingMember}
                  >
                    {isAddingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("common.add")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="properties">
              <Home className="mr-2 h-4 w-4" />
              {t("wishlist.properties")} ({items.length})
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="mr-2 h-4 w-4" />
              {t("wishlist.members")} ({members.length})
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "properties" && (
            <div className="flex space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <ListFilter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("wishlist.filter.all")}</SelectItem>
                  <SelectItem value="considering">{t("property.status.considering")}</SelectItem>
                  <SelectItem value="interested">{t("property.status.interested")}</SelectItem>
                  <SelectItem value="contacted">{t("property.status.contacted")}</SelectItem>
                  <SelectItem value="viewed">{t("property.status.viewed")}</SelectItem>
                  <SelectItem value="rejected">{t("property.status.rejected")}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">{t("wishlist.sort.priority")}</SelectItem>
                  <SelectItem value="price">{t("wishlist.sort.price")}</SelectItem>
                  <SelectItem value="added">{t("wishlist.sort.added")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <TabsContent value="properties" className="mt-6">
          {items.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <Home className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">{t("wishlist.no_properties")}</h2>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                {t("wishlist.no_properties_description")}
              </p>
              {canEditItems && (
                <Button 
                  className="mt-4" 
                  onClick={() => setLocation("/search")}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t("wishlist.add_property")}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedItems.map((item) => (
                <PropertyCard 
                  key={item.id}
                  item={item}
                  canEdit={canEditItems}
                  onUpdateStatus={(status) => updateItem(item.id, { status })}
                  onUpdatePriority={(priority) => updateItem(item.id, { priority })}
                  onRemove={() => removeItem(item.id)}
                  onView={() => setSelectedItemId(item.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="members" className="mt-6">
          <MembersList 
            members={members}
            wishlistOwnerId={wishlist.ownerId}
            currentUserId={user.id}
            onUpdateRole={(userId, role) => updateMemberRole(userId, role as any)}
            onRemoveMember={removeMember}
          />
        </TabsContent>
      </Tabs>
      
      {/* Property Details Dialog */}
      <Dialog open={!!selectedItemId} onOpenChange={(open) => !open && setSelectedItemId(null)}>
        <DialogContent className="max-w-4xl">
          {selectedItemId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {items.find(item => item.id === selectedItemId)?.property && (
                  <div className="space-y-4">
                    <div className="aspect-video overflow-hidden rounded-md">
                      <img 
                        src={items.find(item => item.id === selectedItemId)?.property.images?.[0] || '/images/apartment-interior.jpg'} 
                        alt={items.find(item => item.id === selectedItemId)?.property.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <h2 className="text-xl font-bold">
                      {items.find(item => item.id === selectedItemId)?.property.title}
                    </h2>
                    
                    <div className="flex justify-between">
                      <Badge className="bg-black text-white">
                        ${items.find(item => item.id === selectedItemId)?.property.price.toLocaleString()}
                      </Badge>
                      
                      <Badge className={STATUS_BADGES[(items.find(item => item.id === selectedItemId)?.status as StatusType) || 'considering'].color}>
                        {t(`property.status.${items.find(item => item.id === selectedItemId)?.status || 'considering'}`)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t('location')}:</span>
                        <p>{items.find(item => item.id === selectedItemId)?.property.city}, {items.find(item => item.id === selectedItemId)?.property.country}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('property_type')}:</span>
                        <p>{t(`property.type.${items.find(item => item.id === selectedItemId)?.property.propertyType}`)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('bedrooms')}:</span>
                        <p>{items.find(item => item.id === selectedItemId)?.property.bedrooms}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('bathrooms')}:</span>
                        <p>{items.find(item => item.id === selectedItemId)?.property.bathrooms}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('sqft')}:</span>
                        <p>{items.find(item => item.id === selectedItemId)?.property.squareFeet}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('listing_type')}:</span>
                        <p>{t(`property.listing.${items.find(item => item.id === selectedItemId)?.property.listingType}`)}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm">
                      {items.find(item => item.id === selectedItemId)?.property.description}
                    </p>
                    
                    {items.find(item => item.id === selectedItemId)?.notes && (
                      <div className="p-3 bg-muted rounded-md">
                        <h3 className="text-sm font-medium mb-1">{t('wishlist.notes')}</h3>
                        <p className="text-sm">{items.find(item => item.id === selectedItemId)?.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-4">
                      <Button variant="outline" asChild>
                        <a href={`/properties/${items.find(item => item.id === selectedItemId)?.property.id}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" />
                          {t('view_full_details')}
                        </a>
                      </Button>
                      
                      <Button variant="outline" asChild>
                        <a href={`tel:${items.find(item => item.id === selectedItemId)?.property.contactPhone || '+'}`}>
                          <Phone className="mr-2 h-4 w-4" />
                          {t('contact_agent')}
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedItemId && wishlistId && (
                <CommentSection itemId={selectedItemId} wishlistId={wishlistId} />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}