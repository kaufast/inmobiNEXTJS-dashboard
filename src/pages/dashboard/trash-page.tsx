import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Property } from "@shared/schema";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { format, addDays, differenceInDays } from 'date-fns';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  AlertTriangle,
  Building,
  Check,
  Clock,
  Loader2,
  RotateCcw,
  Trash,
  Trash2,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Interface for trashed properties that includes deletion date
interface TrashedProperty extends Property {
  trashDate?: string;
  trashExpiry?: string;
}

export default function TrashPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation("dashboard");
  
  // State for multiple selection
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showEmptyTrashDialog, setShowEmptyTrashDialog] = useState(false);
  const [showDeleteForeverDialog, setShowDeleteForeverDialog] = useState(false);

  // Fetch trashed properties
  const { data: trashedProperties, isLoading } = useQuery<TrashedProperty[]>({
    queryKey: ["/api/properties/trash"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/properties/trash");
      return await res.json();
    },
  });

  // Restore properties mutation
  const restoreMutation = useMutation({
    mutationFn: async (propertyIds: number[]) => {
      const response = await apiRequest("POST", "/api/properties/restore", { propertyIds });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t("agentProperties.trash.restoreSuccess", "Properties restored successfully"),
        description: t("agentProperties.trash.restoreSuccessDescription", 
          "The selected properties have been restored to your listings"),
      });
      setSelectedProperties([]);
      queryClient.invalidateQueries({ queryKey: ["/api/properties/trash"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
    onError: (error: any) => {
      toast({
        title: t("agentProperties.trash.restoreError", "Error restoring properties"),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Permanently delete properties mutation
  const permanentDeleteMutation = useMutation({
    mutationFn: async (propertyIds: number[]) => {
      const response = await apiRequest("DELETE", "/api/properties/permanent", { propertyIds });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t("agentProperties.trash.deleteSuccess", "Properties permanently deleted"),
        description: t("agentProperties.trash.deleteSuccessDescription", 
          "The selected properties have been permanently removed"),
      });
      setSelectedProperties([]);
      queryClient.invalidateQueries({ queryKey: ["/api/properties/trash"] });
    },
    onError: (error: any) => {
      toast({
        title: t("agentProperties.trash.deleteError", "Error deleting properties"),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Empty trash mutation
  const emptyTrashMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/properties/empty-trash");
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t("agentProperties.trash.emptySuccess", "Trash emptied successfully"),
        description: t("agentProperties.trash.emptySuccessDescription", 
          "All properties in trash have been permanently deleted"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties/trash"] });
    },
    onError: (error: any) => {
      toast({
        title: t("agentProperties.trash.emptyError", "Error emptying trash"),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle property selection
  const togglePropertySelection = (propertyId: number) => {
    setSelectedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };

  // Select all properties
  const selectAllProperties = () => {
    if (trashedProperties && trashedProperties.length > 0) {
      if (selectedProperties.length === trashedProperties.length) {
        // If all are selected, deselect all
        setSelectedProperties([]);
      } else {
        // Otherwise select all
        setSelectedProperties(trashedProperties.map(p => p.id));
      }
    }
  };

  // Handle restore confirmation
  const confirmRestore = () => {
    if (selectedProperties.length > 0) {
      restoreMutation.mutate(selectedProperties);
    }
    setShowRestoreDialog(false);
  };

  // Handle permanent delete confirmation
  const confirmDeleteForever = () => {
    if (selectedProperties.length > 0) {
      permanentDeleteMutation.mutate(selectedProperties);
    }
    setShowDeleteForeverDialog(false);
  };

  // Handle empty trash confirmation
  const confirmEmptyTrash = () => {
    emptyTrashMutation.mutate();
    setShowEmptyTrashDialog(false);
  };

  // Calculate days until deletion for a property
  const getDaysUntilDeletion = (expiryDate: string): { days: number; text: string } => {
    if (!expiryDate) return { days: 14, text: t("agentProperties.trash.deleteInDays", { days: 14 }) };
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysLeft = differenceInDays(expiry, now);
    
    if (daysLeft <= 0) {
      return { 
        days: 0, 
        text: t("agentProperties.trash.deleteToday", "Will be deleted today") 
      };
    } else if (daysLeft === 1) {
      return { 
        days: 1, 
        text: t("agentProperties.trash.deleteTomorrow", "Will be deleted tomorrow") 
      };
    } else {
      return { 
        days: daysLeft, 
        text: t("agentProperties.trash.deleteInDays", { days: daysLeft }) 
      };
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("agentProperties.trash.title", "Property Trash")}</h2>
            <p className="text-muted-foreground">
              {t("agentProperties.trash.trashExpiryWarning", "Properties in trash will be permanently deleted after 14 days")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-gray-300"
              onClick={() => setShowRestoreDialog(true)}
              disabled={selectedProperties.length === 0 || restoreMutation.isPending}
            >
              {restoreMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              {t("agentProperties.trash.restoreSelected", "Restore Selected")} 
              {selectedProperties.length > 0 && `(${selectedProperties.length})`}
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteForeverDialog(true)}
              disabled={selectedProperties.length === 0 || permanentDeleteMutation.isPending}
            >
              {permanentDeleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t("agentProperties.trash.deleteForever", "Delete Forever")}
              {selectedProperties.length > 0 && ` (${selectedProperties.length})`}
            </Button>
            {trashedProperties && trashedProperties.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={() => setShowEmptyTrashDialog(true)}
                disabled={emptyTrashMutation.isPending}
              >
                {emptyTrashMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="mr-2 h-4 w-4" />
                )}
                {t("agentProperties.trash.emptyTrash", "Empty Trash")}
              </Button>
            )}
            <Button className="bg-[#131313]">
              <Link href="/dashboard/properties">
                <X className="mr-2 h-4 w-4" /> {t("actions.cancel", "Cancel")}
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-xl">{t("agentProperties.trash.trashedProperties", "Properties in Trash")}</CardTitle>
            <CardDescription>
              {isLoading 
                ? t("general.loading", "Loading...")
                : t("agentProperties.trash.trashedPropertiesCount", "{{count}} properties in trash", 
                    { count: trashedProperties?.length || 0 })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : trashedProperties && trashedProperties.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={
                            trashedProperties.length > 0 && 
                            selectedProperties.length === trashedProperties.length
                          }
                          onCheckedChange={selectAllProperties}
                          aria-label={t("agentProperties.selectAll", "Select all properties")}
                        />
                      </TableHead>
                      <TableHead>{t("agentProperties.table.property", "Property")}</TableHead>
                      <TableHead>{t("agentProperties.table.id", "ID")}</TableHead>
                      <TableHead>{t("agentProperties.table.price", "Price")}</TableHead>
                      <TableHead>{t("agentProperties.trash.deletionDate", "Will be deleted")}</TableHead>
                      <TableHead className="text-right">{t("agentProperties.table.actions", "Actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trashedProperties.map((property) => {
                      const deletionInfo = getDaysUntilDeletion(property.trashExpiry || '');
                      return (
                        <TableRow 
                          key={property.id} 
                          className={selectedProperties.includes(property.id) ? "bg-muted/50" : ""}
                        >
                          <TableCell>
                            <Checkbox 
                              checked={selectedProperties.includes(property.id)}
                              onCheckedChange={() => togglePropertySelection(property.id)}
                              aria-label={`Select property ${property.title}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>{property.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>{property.id}</TableCell>
                          <TableCell>
                            ${property.price.toLocaleString()}
                            {property.listingType === "rent" && 
                              t("agentProperties.pricePerMonth", "/mo")}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                deletionInfo.days <= 1 
                                  ? "bg-red-100 text-red-800 border-red-300" 
                                  : deletionInfo.days <= 3 
                                    ? "bg-amber-100 text-amber-800 border-amber-300"
                                    : "bg-gray-100 text-gray-800 border-gray-300"
                              }
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {deletionInfo.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                className="border-black hover:bg-black hover:text-white"
                                onClick={() => {
                                  setSelectedProperties([property.id]);
                                  setShowRestoreDialog(true);
                                }}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                className="text-red-500 hover:text-white hover:bg-red-500"
                                onClick={() => {
                                  setSelectedProperties([property.id]);
                                  setShowDeleteForeverDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">
                  {t("agentProperties.trash.noItemsInTrash", "No properties in trash")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("agentProperties.trash.emptyTrashDescription", 
                    "Items moved to trash will appear here for 14 days before being permanently deleted")}
                </p>
                <Button variant="outline" className="mt-2">
                  <Link href="/dashboard/properties">
                    {t("agentProperties.trash.backToProperties", "Back to Properties")}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("agentProperties.trash.restoreTitle", "Restore Properties")}
            </DialogTitle>
            <DialogDescription>
              {t("agentProperties.trash.restoreDescription", 
                "Restore properties from trash to your active listings.")}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            {t("agentProperties.trash.restoreCountMessage", 
              "You are about to restore {{count}} {{properties}}.", { 
                count: selectedProperties.length,
                properties: selectedProperties.length === 1 ? 
                  t("agentProperties.trash.property", "property") : 
                  t("agentProperties.trash.properties", "properties")
              })}
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRestoreDialog(false)}
            >
              {t("actions.cancel", "Cancel")}
            </Button>
            <Button 
              variant="default"
              onClick={confirmRestore}
              disabled={restoreMutation.isPending}
              className="bg-black hover:bg-gray-800"
            >
              {restoreMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              {t("agentProperties.trash.restoreConfirm", "Restore")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Forever Confirmation Dialog */}
      <Dialog open={showDeleteForeverDialog} onOpenChange={setShowDeleteForeverDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {t("agentProperties.trash.deleteForeverTitle", "Delete Properties Permanently?")}
            </DialogTitle>
            <DialogDescription>
              {t("agentProperties.trash.deleteForeverDescription", 
                "This action cannot be undone. The properties will be permanently deleted.")}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            {t("agentProperties.trash.deleteForeverCountMessage", 
              "You are about to permanently delete {{count}} {{properties}}.", { 
                count: selectedProperties.length,
                properties: selectedProperties.length === 1 ? 
                  t("agentProperties.trash.property", "property") : 
                  t("agentProperties.trash.properties", "properties")
              })}
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteForeverDialog(false)}
            >
              {t("actions.cancel", "Cancel")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteForever}
              disabled={permanentDeleteMutation.isPending}
            >
              {permanentDeleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t("agentProperties.trash.deleteForeverConfirm", "Delete Forever")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty Trash Confirmation Dialog */}
      <Dialog open={showEmptyTrashDialog} onOpenChange={setShowEmptyTrashDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {t("agentProperties.trash.emptyTrashTitle", "Empty Trash?")}
            </DialogTitle>
            <DialogDescription>
              {t("agentProperties.trash.emptyTrashDescription", 
                "This will permanently delete all properties in trash. This action cannot be undone.")}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            {t("agentProperties.trash.emptyTrashCountMessage", 
              "You are about to permanently delete {{count}} properties from trash.", { 
                count: trashedProperties?.length || 0
              })}
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEmptyTrashDialog(false)}
            >
              {t("actions.cancel", "Cancel")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmEmptyTrash}
              disabled={emptyTrashMutation.isPending}
            >
              {emptyTrashMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash className="mr-2 h-4 w-4" />
              )}
              {t("agentProperties.trash.emptyTrashConfirm", "Empty Trash")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 