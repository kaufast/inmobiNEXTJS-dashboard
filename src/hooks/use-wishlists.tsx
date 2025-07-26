import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Wishlist, WishlistMember, WishlistItem } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useWishlists() {
  const { toast } = useToast();

  // Get all wishlists for the current user
  const {
    data: wishlists = [],
    isLoading: isLoadingWishlists,
    error: wishlistsError,
  } = useQuery<Wishlist[]>({
    queryKey: ["/api/wishlists"],
    enabled: true,
  });

  // Create a new wishlist
  const createWishlistMutation = useMutation({
    mutationFn: async (wishlist: { name: string; description?: string; coverImage?: string; isPublic?: boolean }) => {
      const res = await apiRequest("POST", "/api/wishlists", wishlist);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists"] });
      toast({
        title: "Wishlist created",
        description: "Your wishlist has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create wishlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update a wishlist
  const updateWishlistMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; name?: string; description?: string; coverImage?: string; isPublic?: boolean }) => {
      const res = await apiRequest("PATCH", `/api/wishlists/${id}`, data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists", variables.id] });
      toast({
        title: "Wishlist updated",
        description: "Your wishlist has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update wishlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a wishlist
  const deleteWishlistMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/wishlists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists"] });
      toast({
        title: "Wishlist deleted",
        description: "The wishlist has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete wishlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    wishlists,
    isLoadingWishlists,
    wishlistsError,
    createWishlist: createWishlistMutation.mutate,
    isCreatingWishlist: createWishlistMutation.isPending,
    updateWishlist: updateWishlistMutation.mutate,
    isUpdatingWishlist: updateWishlistMutation.isPending,
    deleteWishlist: deleteWishlistMutation.mutate,
    isDeletingWishlist: deleteWishlistMutation.isPending,
  };
}

export function useWishlistDetails(wishlistId: number | null) {
  const { toast } = useToast();
  
  // Get a specific wishlist details
  const {
    data: wishlist,
    isLoading: isLoadingWishlist,
    error: wishlistError,
  } = useQuery<Wishlist>({
    queryKey: ["/api/wishlists", wishlistId],
    enabled: !!wishlistId,
  });

  // Get wishlist members
  const {
    data: members = [],
    isLoading: isLoadingMembers,
    error: membersError,
  } = useQuery<(WishlistMember & { user: { id: number; username: string; name: string; email: string; avatar?: string } })[]>({
    queryKey: ["/api/wishlists", wishlistId, "members"],
    enabled: !!wishlistId,
  });

  // Get wishlist items (properties)
  const {
    data: itemsData = { items: [], members: [] },
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery<{ 
    items: (WishlistItem & { property: any })[];
    members: (WishlistMember & { user: { id: number; username: string; name: string; avatar?: string } })[];
  }>({
    queryKey: ["/api/wishlists", wishlistId, "items"],
    enabled: !!wishlistId,
  });

  // Add a member to the wishlist
  const addMemberMutation = useMutation({
    mutationFn: async ({ wishlistId, username, role = "member" }: { wishlistId: number; username: string; role?: "member" | "viewer" }) => {
      const res = await apiRequest("POST", `/api/wishlists/${wishlistId}/members`, { username, role });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists", variables.wishlistId, "members"] });
      toast({
        title: "Member added",
        description: "The member has been added to the wishlist.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update a member's role
  const updateMemberRoleMutation = useMutation({
    mutationFn: async ({ wishlistId, userId, role }: { wishlistId: number; userId: number; role: "owner" | "member" | "viewer" }) => {
      const res = await apiRequest("PATCH", `/api/wishlists/${wishlistId}/members/${userId}`, { role });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists", variables.wishlistId, "members"] });
      toast({
        title: "Role updated",
        description: "The member's role has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove a member from the wishlist
  const removeMemberMutation = useMutation({
    mutationFn: async ({ wishlistId, userId }: { wishlistId: number; userId: number }) => {
      await apiRequest("DELETE", `/api/wishlists/${wishlistId}/members/${userId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists", variables.wishlistId, "members"] });
      toast({
        title: "Member removed",
        description: "The member has been removed from the wishlist.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add a property to the wishlist
  const addItemMutation = useMutation({
    mutationFn: async ({ wishlistId, propertyId, notes, priority = 0 }: { wishlistId: number; propertyId: number; notes?: string; priority?: number }) => {
      const res = await apiRequest("POST", `/api/wishlists/${wishlistId}/items`, { propertyId, notes, priority });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists", variables.wishlistId, "items"] });
      toast({
        title: "Property added",
        description: "The property has been added to the wishlist.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add property",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update an item
  const updateItemMutation = useMutation({
    mutationFn: async ({ wishlistId, itemId, notes, priority, status }: { wishlistId: number; itemId: number; notes?: string; priority?: number; status?: string }) => {
      const res = await apiRequest("PATCH", `/api/wishlists/${wishlistId}/items/${itemId}`, { notes, priority, status });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists", variables.wishlistId, "items"] });
      toast({
        title: "Item updated",
        description: "The wishlist item has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove an item from the wishlist
  const removeItemMutation = useMutation({
    mutationFn: async ({ wishlistId, itemId }: { wishlistId: number; itemId: number }) => {
      await apiRequest("DELETE", `/api/wishlists/${wishlistId}/items/${itemId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists", variables.wishlistId, "items"] });
      toast({
        title: "Item removed",
        description: "The property has been removed from the wishlist.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove property",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    wishlist,
    isLoadingWishlist,
    wishlistError,
    members,
    isLoadingMembers,
    membersError,
    items: itemsData.items || [],
    itemMembers: itemsData.members || [],
    isLoadingItems,
    itemsError,
    addMember: (username: string, role: "member" | "viewer" = "member") => {
      if (wishlistId) {
        addMemberMutation.mutate({ wishlistId, username, role });
      }
    },
    isAddingMember: addMemberMutation.isPending,
    updateMemberRole: (userId: number, role: "owner" | "member" | "viewer") => {
      if (wishlistId) {
        updateMemberRoleMutation.mutate({ wishlistId, userId, role });
      }
    },
    isUpdatingMemberRole: updateMemberRoleMutation.isPending,
    removeMember: (userId: number) => {
      if (wishlistId) {
        removeMemberMutation.mutate({ wishlistId, userId });
      }
    },
    isRemovingMember: removeMemberMutation.isPending,
    addItem: (propertyId: number, notes?: string, priority: number = 0) => {
      if (wishlistId) {
        addItemMutation.mutate({ wishlistId, propertyId, notes, priority });
      }
    },
    isAddingItem: addItemMutation.isPending,
    updateItem: (itemId: number, data: { notes?: string; priority?: number; status?: string }) => {
      if (wishlistId) {
        updateItemMutation.mutate({ wishlistId, itemId, ...data });
      }
    },
    isUpdatingItem: updateItemMutation.isPending,
    removeItem: (itemId: number) => {
      if (wishlistId) {
        removeItemMutation.mutate({ wishlistId, itemId });
      }
    },
    isRemovingItem: removeItemMutation.isPending,
  };
}

export function useWishlistItemInteractions(wishlistId: number | null, itemId: number | null) {
  const { toast } = useToast();
  
  // Get comments for a specific wishlist item
  const {
    data: comments = [],
    isLoading: isLoadingComments,
    error: commentsError,
  } = useQuery<any[]>({
    queryKey: ["/api/wishlists/items", itemId, "comments"],
    enabled: !!itemId,
  });
  
  // Get ratings for a specific wishlist item
  const {
    data: ratings = [],
    isLoading: isLoadingRatings,
    error: ratingsError,
  } = useQuery<any[]>({
    queryKey: ["/api/wishlists/items", itemId, "ratings"],
    enabled: !!itemId,
  });
  
  // Add a comment to a wishlist item
  const addCommentMutation = useMutation({
    mutationFn: async ({ itemId, content }: { itemId: number; content: string }) => {
      const res = await apiRequest("POST", `/api/wishlists/items/${itemId}/comments`, { content });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists/items", variables.itemId, "comments"] });
      toast({
        title: "Comment added",
        description: "Your comment has been added.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete a comment
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest("DELETE", `/api/wishlists/comments/${commentId}`);
    },
    onSuccess: () => {
      if (itemId) {
        queryClient.invalidateQueries({ queryKey: ["/api/wishlists/items", itemId, "comments"] });
      }
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Add a rating to a wishlist item
  const addRatingMutation = useMutation({
    mutationFn: async ({ itemId, rating }: { itemId: number; rating: number }) => {
      const res = await apiRequest("POST", `/api/wishlists/items/${itemId}/ratings`, { rating });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists/items", variables.itemId, "ratings"] });
      toast({
        title: "Rating added",
        description: "Your rating has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add rating",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return {
    comments,
    isLoadingComments,
    commentsError,
    ratings,
    isLoadingRatings,
    ratingsError,
    addComment: (content: string) => {
      if (itemId) {
        addCommentMutation.mutate({ itemId, content });
      }
    },
    isAddingComment: addCommentMutation.isPending,
    deleteComment: deleteCommentMutation.mutate,
    isDeletingComment: deleteCommentMutation.isPending,
    addRating: (rating: number) => {
      if (itemId) {
        addRatingMutation.mutate({ itemId, rating });
      }
    },
    isAddingRating: addRatingMutation.isPending,
    // Calculate the average rating
    averageRating: ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0,
  };
}