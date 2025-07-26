import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Property } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Building,
  Check,
  Edit,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash,
  X,
  Edit2,
  DollarSign,
  Tag,
  MapPin,
  Calendar,
  Settings
} from "lucide-react";
import { Link } from "wouter";
import { BulkUploadButton } from "@/components/bulk-upload/BulkUploadButton";
import { ReportIssueButton } from "@/components/common/ReportIssueButton";

interface BulkEditData {
  price?: number;
  status?: "available" | "sold" | "rented" | "pending";
  isVerified?: boolean;
  isPremium?: boolean;
  listingType?: "sale" | "rent";
}

export default function PropertiesManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['dashboard', 'properties', 'common']);

  // State management
  const [selectMode, setSelectMode] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<BulkEditData>({});

  // Fetch properties
  const { data: properties = [], isLoading, error } = useQuery<Property[]>({
    queryKey: ['agent-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await fetch(`/api/properties/owner/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
    enabled: !!user,
  });

  // Bulk edit mutation
  const bulkEditMutation = useMutation({
    mutationFn: async (data: { propertyIds: number[]; updates: BulkEditData }) => {
      const response = await fetch('/api/properties/bulk-edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update properties');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
      toast({
        title: "Properties Updated",
        description: `${selectedProperties.length} properties have been updated successfully.`,
      });
      setBulkEditOpen(false);
      setSelectedProperties([]);
      setSelectMode(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update properties. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (propertyIds: number[]) => {
      const response = await fetch('/api/properties/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyIds }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete properties');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
      toast({
        title: "Properties Deleted",
        description: `${selectedProperties.length} properties have been deleted successfully.`,
      });
      setBulkDeleteOpen(false);
      setSelectedProperties([]);
      setSelectMode(false);
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete properties. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Single property delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete property');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
      toast({
        title: "Property Deleted",
        description: "Property has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter properties
  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "verified" && property.isVerified) ||
                         (filterStatus === "unverified" && !property.isVerified) ||
                         (filterStatus === "premium" && property.isPremium) ||
                         (filterStatus === "sale" && property.listingType === "sale") ||
                         (filterStatus === "rent" && property.listingType === "rent");
    
    return matchesSearch && matchesStatus;
  });

  // Selection handlers
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedProperties([]);
  };

  const togglePropertySelection = (propertyId: number) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const selectAllProperties = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties.map(p => p.id));
    }
  };

  // Bulk operations
  const handleBulkEdit = () => {
    if (selectedProperties.length === 0) return;
    setBulkEditOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedProperties.length === 0) return;
    setBulkDeleteOpen(true);
  };

  const executeBulkEdit = () => {
    const cleanData = Object.entries(bulkEditData).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {} as BulkEditData);

    if (Object.keys(cleanData).length === 0) {
      toast({
        title: "No Changes",
        description: "Please select at least one field to update.",
        variant: "destructive",
      });
      return;
    }

    bulkEditMutation.mutate({
      propertyIds: selectedProperties,
      updates: cleanData,
    });
  };

  const executeBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedProperties);
  };

  const allSelected = filteredProperties.length > 0 && selectedProperties.length === filteredProperties.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Properties Management</h2>
          <p className="text-muted-foreground">Manage your property listings efficiently</p>
        </div>
        <div className="flex gap-2">
          <ReportIssueButton context="properties" variant="outline" />
          {selectMode ? (
            <>
              <Button variant="outline" onClick={toggleSelectMode}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button variant="outline" onClick={selectAllProperties}>
                <Check className="mr-2 h-4 w-4" />
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
              {selectedProperties.length > 0 && (
                <>
                  <Button variant="outline" onClick={handleBulkEdit}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit ({selectedProperties.length})
                  </Button>
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete ({selectedProperties.length})
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button onClick={toggleSelectMode} variant="outline">
                <Check className="mr-2 h-4 w-4" /> Select Multiple
              </Button>
              <Button asChild className="bg-black text-white hover:bg-gray-800">
                <Link href="/dashboard/properties/new">
                  <Plus className="mr-2 h-4 w-4" /> Add Property
                </Link>
              </Button>
              <BulkUploadButton
                user={user}
                variant="outline"
                showBadge={true}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              />
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Properties</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Property Listings</CardTitle>
          <CardDescription>
            {filteredProperties.length} properties found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {selectMode && (
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={selectAllProperties}
                        aria-label="Select all properties"
                      />
                    </TableHead>
                  )}
                  <TableHead>Property</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => (
                    <TableRow 
                      key={property.id} 
                      className={selectedProperties.includes(property.id) ? "bg-muted/50" : ""}
                    >
                      {selectMode && (
                        <TableCell>
                          <Checkbox
                            checked={selectedProperties.includes(property.id)}
                            onCheckedChange={() => togglePropertySelection(property.id)}
                            aria-label={`Select ${property.title}`}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {property.images && property.images.length > 0 && (
                            <img 
                              src={typeof property.images[0] === 'string' ? property.images[0] : property.images[0]?.url}
                              alt={property.title}
                              className="h-12 w-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{property.title}</p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {property.address}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant={property.isVerified ? "default" : "outline"}>
                            {property.isVerified ? "Verified" : "Pending"}
                          </Badge>
                          {property.isPremium && (
                            <Badge variant="secondary">Premium</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {property.price.toLocaleString()}
                          {property.listingType === "rent" && "/month"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {property.listingType === "sale" ? "For Sale" : "For Rent"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/property/${property.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/properties/edit/${property.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50" 
                            onClick={() => deleteMutation.mutate(property.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={selectMode ? 6 : 5} 
                      className="text-center py-8 text-muted-foreground"
                    >
                      No properties found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Edit Properties</DialogTitle>
            <DialogDescription>
              Edit {selectedProperties.length} selected properties. Leave fields empty to keep current values.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="Enter price"
                    value={bulkEditData.price || ""}
                    onChange={(e) => setBulkEditData(prev => ({ 
                      ...prev, 
                      price: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Listing Type</Label>
                <Select 
                  value={bulkEditData.listingType || ""}
                  onValueChange={(value) => setBulkEditData(prev => ({ 
                    ...prev, 
                    listingType: value as "sale" | "rent" 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Verification Status</Label>
                <Select 
                  value={bulkEditData.isVerified?.toString() || ""}
                  onValueChange={(value) => setBulkEditData(prev => ({ 
                    ...prev, 
                    isVerified: value === "true" 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Premium Status</Label>
                <Select 
                  value={bulkEditData.isPremium?.toString() || ""}
                  onValueChange={(value) => setBulkEditData(prev => ({ 
                    ...prev, 
                    isPremium: value === "true" 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Premium</SelectItem>
                    <SelectItem value="false">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEditOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={executeBulkEdit}
              disabled={bulkEditMutation.isPending}
              className="bg-black text-white hover:bg-gray-800"
            >
              {bulkEditMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Properties
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Properties</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProperties.length} selected properties? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {bulkDeleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Properties
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}