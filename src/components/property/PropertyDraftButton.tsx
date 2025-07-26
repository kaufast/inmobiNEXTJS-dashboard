import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, FileText, FilePlus, Plus, Upload, Loader2 } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

interface PropertyDraft {
  id?: string;
  title: string;
  description: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  createdAt: string;
}

const defaultDraft: PropertyDraft = {
  title: '',
  description: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  propertyType: 'house',
  createdAt: new Date().toISOString(),
};

export default function PropertyDraftButton() {
  const { t, i18n } = useTranslation('properties');
  const [open, setOpen] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<PropertyDraft>(defaultDraft);
  const [drafts, setDrafts] = useState<PropertyDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Get current locale for routing
  const locale = i18n.language || 'en-GB';
  const route = (path: string) => `/${locale}${path.startsWith('/') ? path : `/${path}`}`;

  // Load drafts from localStorage on component mount
  useEffect(() => {
    const savedDrafts = localStorage.getItem('propertyDrafts');
    if (savedDrafts) {
      try {
        setDrafts(JSON.parse(savedDrafts));
      } catch (e) {
        console.error('Failed to parse drafts:', e);
      }
    }
  }, []);

  // Save drafts to localStorage
  const saveDrafts = (updatedDrafts: PropertyDraft[]) => {
    localStorage.setItem('propertyDrafts', JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
  };

  // Save current draft
  const saveDraft = () => {
    if (!currentDraft.title.trim()) {
      toast({
        title: t('draft.titleRequired'),
        description: t('draft.titleRequiredDescription'),
        className: 'bg-red-50 border-red-200 text-red-800',
      });
      return;
    }

    const now = new Date().toISOString();
    const updatedDraft = {
      ...currentDraft,
      createdAt: now,
      id: currentDraft.id || `draft_${Date.now()}`,
    };

    let updatedDrafts: PropertyDraft[];
    if (currentDraft.id) {
      // Update existing draft
      updatedDrafts = drafts.map(d => d.id === currentDraft.id ? updatedDraft : d);
    } else {
      // Create new draft
      updatedDrafts = [...drafts, updatedDraft];
    }

    saveDrafts(updatedDrafts);
    toast({
      title: t('draft.saved'),
      description: t('draft.savedDescription'),
      className: 'bg-blue-50 border-blue-200 text-blue-800',
    });
    
    setCurrentDraft(defaultDraft);
    setOpen(false);
  };
  
  // Submit property to server
  const submitProperty = async (draft: PropertyDraft) => {
    if (!draft.title.trim()) {
      toast({
        title: t('draft.titleRequired'),
        description: t('draft.titleRequiredDescription'),
        className: 'bg-red-50 border-red-200 text-red-800',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert draft to property format
      const propertyData = {
        title: draft.title,
        description: draft.description,
        price: Number(draft.price) || 0,
        address: draft.title, // Using title as address for now
        bedrooms: Number(draft.bedrooms) || 0,
        bathrooms: Number(draft.bathrooms) || 0,
        propertyType: draft.propertyType,
        status: 'available',
        listingType: 'buy',
        size: 0,
        yearBuilt: new Date().getFullYear(),
        features: [],
        agentId: 232, // Set to agent ID - in a real app, use current user ID
        neighborhoodId: 1,
        latitude: 40.7128,
        longitude: -74.0060,
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9'],
        views: 0,
        isVerified: true,
        isPremium: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Send to server
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit property');
      }
      
      // If this was a draft with an ID, remove it from drafts
      if (draft.id) {
        const updatedDrafts = drafts.filter(d => d.id !== draft.id);
        saveDrafts(updatedDrafts);
      }
      
      // Refresh properties list
      queryClient.invalidateQueries({queryKey: ['/api/properties']});
      queryClient.invalidateQueries({queryKey: ['/api/properties/featured']});
      
      toast({
        title: t('draft.propertyAddedSuccessfully'),
        description: t('draft.propertyAddedSuccessfullyDescription'),
        className: 'bg-green-50 border-green-200 text-green-800',
      });
      
      setShowDrafts(false);
    } catch (error) {
      console.error('Error submitting property:', error);
      toast({
        title: t('draft.failedToAddProperty'),
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        className: 'bg-red-50 border-red-200 text-red-800',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load a draft for editing
  const editDraft = (draft: PropertyDraft) => {
    setCurrentDraft(draft);
    setShowDrafts(false);
    setOpen(true);
  };

  // Delete a draft
  const deleteDraft = (draftId: string) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    saveDrafts(updatedDrafts);
    toast({
      title: t('draft.deleted'),
      description: t('draft.deletedDescription'),
      className: 'bg-orange-50 border-orange-200 text-orange-800',
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Create a new draft
  const createNewDraft = () => {
    setLocation(route('/add-property-wizard'));
  };

  return (
    <div>
      {/* Main draft button */}
      <Button
        className="bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
        onClick={() => setLocation(route('/add-property-wizard'))}
      >
        <Plus className="h-4 w-4 mr-2" />
        {t('draft.addProperty')}
      </Button>

      {/* Button to show drafts */}
      {drafts.length > 0 && (
        <Button
          variant="outline"
          className="ml-2 border-[#131313] text-[#131313] hover:bg-[#131313] hover:text-white"
          onClick={() => setShowDrafts(true)}
        >
          <FileText className="h-4 w-4 mr-2" />
          {t('draft.draftsWithCount', { count: drafts.length })}
        </Button>
      )}

      {/* Property draft form dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentDraft.id ? t('draft.edit') : t('draft.create')}</DialogTitle>
            <DialogDescription>
              {currentDraft.id ?
                `${t('draft.lastSaved')}: ${formatDate(currentDraft.createdAt)}` :
                t('add.description')
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                {t('add.basicInfo.titleLabel')}
              </Label>
              <Input
                id="title"
                placeholder={t('add.basicInfo.titlePlaceholder')}
                className="col-span-3"
                value={currentDraft.title}
                onChange={(e) => setCurrentDraft({...currentDraft, title: e.target.value})}
              />
            </div>
            
            {/* Price */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                {t('add.basicInfo.priceLabel')}
              </Label>
              <Input
                id="price"
                type="number"
                placeholder={t('add.basicInfo.pricePlaceholder')}
                className="col-span-3"
                value={currentDraft.price}
                onChange={(e) => setCurrentDraft({...currentDraft, price: e.target.value})}
              />
            </div>
            
            {/* Property Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                {t('add.basicInfo.propertyTypeLabel')}
              </Label>
              <Select 
                value={currentDraft.propertyType}
                onValueChange={(value) => setCurrentDraft({...currentDraft, propertyType: value})}
              >
                <SelectTrigger id="type" className="col-span-3">
                  <SelectValue placeholder={t('add.basicInfo.propertyTypeLabel')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">{t('types.house')}</SelectItem>
                  <SelectItem value="apartment">{t('types.apartment')}</SelectItem>
                  <SelectItem value="condo">{t('types.condo')}</SelectItem>
                  <SelectItem value="townhouse">{t('types.townhouse')}</SelectItem>
                  <SelectItem value="land">{t('types.land')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Bedrooms */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bedrooms" className="text-right">
                {t('add.basicInfo.bedroomsLabel')}
              </Label>
              <Input
                id="bedrooms"
                type="number"
                className="col-span-3"
                value={currentDraft.bedrooms}
                onChange={(e) => setCurrentDraft({...currentDraft, bedrooms: e.target.value})}
              />
            </div>
            
            {/* Bathrooms */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bathrooms" className="text-right">
                {t('add.basicInfo.bathroomsLabel')}
              </Label>
              <Input
                id="bathrooms"
                type="number"
                className="col-span-3"
                value={currentDraft.bathrooms}
                onChange={(e) => setCurrentDraft({...currentDraft, bathrooms: e.target.value})}
              />
            </div>
            
            {/* Description */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right">
                {t('add.basicInfo.descriptionLabel')}
              </Label>
              <Textarea
                id="description"
                placeholder={t('add.basicInfo.descriptionPlaceholder')}
                className="col-span-3"
                value={currentDraft.description}
                onChange={(e) => setCurrentDraft({...currentDraft, description: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('general.cancel', { ns: 'actions' })}
            </Button>
            <Button 
              onClick={saveDraft}
              className="mr-2"
            >
              <Save className="h-4 w-4 mr-2" />
              {t('draft.save')}
            </Button>
            <Button 
              disabled={isSubmitting || !currentDraft.title.trim()} 
              onClick={() => {
                if (currentDraft.title.trim()) {
                  submitProperty(currentDraft);
                  setOpen(false);
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('actions.processing')}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('add.buttons.createProperty')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Drafts list dialog */}
      <Dialog open={showDrafts} onOpenChange={setShowDrafts}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('draft.savedPropertyDrafts')}</DialogTitle>
            <DialogDescription>
              {t('draft.continueSavedDraft')}
            </DialogDescription>
          </DialogHeader>
          
          {drafts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <h3 className="font-medium text-lg">{t('draft.noSavedDrafts')}</h3>
              <p className="text-sm text-neutral-500 mt-1">{t('draft.noSavedDraftsDescription')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {drafts.map((draft) => (
                <div 
                  key={draft.id} 
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium text-base">{draft.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {draft.propertyType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {t('draft.lastSaved')}: {formatDate(draft.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editDraft(draft)}
                    >
                      {t('actions.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-600 hover:border-red-200"
                      onClick={() => deleteDraft(draft.id!)}
                    >
                      {t('actions.delete')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDrafts(false)}
            >
              {t('general.cancel', { ns: 'actions' })}
            </Button>
            <Button
              onClick={() => {
                setShowDrafts(false);
                createNewDraft();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('draft.createNew')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}