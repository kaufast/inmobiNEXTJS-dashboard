import { useState, useEffect } from "react";
import { useWishlists, useWishlistDetails } from "@/hooks/use-wishlists";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, Plus, Bookmark } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormItem, FormControl } from "@/components/ui/form";

interface AddToWishlistDialogProps {
  propertyId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function AddToWishlistDialog({ 
  propertyId, 
  open, 
  onOpenChange, 
  trigger 
}: AddToWishlistDialogProps) {
  const { t } = useTranslation(['properties', 'common']);
  const { user } = useAuth();
  const { wishlists, isLoadingWishlists } = useWishlists();
  const [selectedWishlistId, setSelectedWishlistId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<string>("0");
  const { toast } = useToast();
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedWishlistId(wishlists.length > 0 ? String(wishlists[0].id) : "");
      setNotes("");
      setPriority("0");
    }
  }, [open, wishlists]);

  // Find the selected wishlist details
  const { 
    addItem, 
    isAddingItem 
  } = selectedWishlistId 
    ? useWishlistDetails(parseInt(selectedWishlistId))
    : { addItem: () => {}, isAddingItem: false };

  const handleAddToWishlist = () => {
    if (selectedWishlistId) {
      addItem(propertyId, notes, parseInt(priority));
      onOpenChange(false);
    }
  };

  // Filter wishlists where the user can add properties (owner or member, not viewer)
  const editableWishlists = wishlists.filter(w => 
    w.ownerId === user?.id || 
    (w.members && w.members.some(m => m.userId === user?.id && m.role !== 'viewer'))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('add_to_wishlist')}</DialogTitle>
        </DialogHeader>
        
        {isLoadingWishlists ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : editableWishlists.length === 0 ? (
          <div className="py-6 text-center">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('no_wishlists')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('create_wishlist_first')}
            </p>
            <Button asChild>
              <a href="/wishlists">
                <Plus className="mr-2 h-4 w-4" />
                {t('create_wishlist')}
              </a>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="wishlist">{t('select_wishlist')}</Label>
                <Select 
                  value={selectedWishlistId} 
                  onValueChange={setSelectedWishlistId}
                >
                  <SelectTrigger id="wishlist">
                    <SelectValue placeholder={t('select_wishlist_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {editableWishlists.map((wishlist) => (
                      <SelectItem key={wishlist.id} value={String(wishlist.id)}>
                        {wishlist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">{t('notes')}</Label>
                <Textarea 
                  id="notes" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('notes_placeholder')}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>{t('priority')}</Label>
                <RadioGroup value={priority} onValueChange={setPriority} className="flex space-x-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="priority-0" />
                    <Label htmlFor="priority-0">{t('priority_0')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="priority-1" />
                    <Label htmlFor="priority-1">{t('priority_1')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="priority-2" />
                    <Label htmlFor="priority-2">{t('priority_2')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="priority-3" />
                    <Label htmlFor="priority-3">{t('priority_3')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('common:actions.cancel')}
              </Button>
              <Button 
                onClick={handleAddToWishlist} 
                disabled={!selectedWishlistId || isAddingItem}
              >
                {isAddingItem ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Heart className="mr-2 h-4 w-4" />
                )}
                {t('add')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Export a button component that can be used to add a property to a wishlist
export function AddToWishlistButton({ propertyId }: { propertyId: number }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  
  return (
    <>
      <Button 
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center"
      >
        <Heart className="mr-2 h-4 w-4" />
        {t('wishlist.add_to_wishlist')}
      </Button>
      
      <AddToWishlistDialog
        propertyId={propertyId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}