import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    Building2,
    CheckCircle2,
    Eye,
    FileCheck,
    Loader2,
    Search,
    UserCheck,
    XCircle,
    CheckSquare,
    Square,
    Filter,
    Wifi,
    WifiOff,
    AlertCircle,
    Home,
    Users,
    Plus,
    Trash2,
    Archive
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApprovalsSSE } from '@/hooks/use-approvals-sse';

// Interface for property approval
interface PropertyApproval {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  propertyType: string;
  ownerId: number;
  status: 'pending_approval' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  location: any;
  images: string[];
  ownerName?: string;
  ownerEmail?: string;
}

// Interface for agent approval (extend for future agent applications)
interface AgentApproval {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  appliedAt: string;
  licenseNumber?: string;
  agency?: string;
}

export default function ApprovalsPage() {
  const { t } = useTranslation(['auth', 'common', 'dashboard']);
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<PropertyApproval | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [selectedProperties, setSelectedProperties] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_approval' | 'approved' | 'rejected'>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Setup SSE for real-time updates
  const {
    connectionStatus,
    lastEvent,
    eventCount,
    connectedClients,
    reconnect,
    isConnected,
    hasError
  } = useApprovalsSSE({
    enableToasts: false, // We'll handle toasts manually to avoid duplicates
    onStatusChange: (data) => {
      console.log('Property approval status changed:', data);
      // Automatically refresh the approvals list
      queryClient.invalidateQueries({ queryKey: ['/api/property-approval/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/property-approval/all'] });
    },
    onNewSubmission: (data) => {
      console.log('New property submission:', data);
      // Show toast for new submissions (admin-only page)
      toast({
        title: '🏠 New Property Submission',
        description: `${data?.userName} submitted ${data?.itemName} for approval`,
      });
      // Refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/property-approval/pending'] });
    },
    onApprovalDeleted: (data) => {
      console.log('Approval deleted:', data);
      // Clear selected properties if any were deleted
      setSelectedProperties(new Set());
      // Refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/property-approval/pending'] });
    }
  });
  
  // Fetch pending property approvals
  const { data: pendingPropertiesData, isLoading: isLoadingPending } = useQuery({
    queryKey: ['/api/property-approval/pending'],
    enabled: !!user && user.role === 'admin',
  });

  // Fetch all property approvals
  const { data: allPropertiesData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['/api/property-approval/all'],
    enabled: !!user && user.role === 'admin',
  });
  
  // Mutation to approve/reject a single property
  const approvePropertyMutation = useMutation({
    mutationFn: async ({
      propertyId, 
      status,
      notes,
      rejectionReason
    }: {
      propertyId: number;
      status: 'approved' | 'rejected';
      notes?: string;
      rejectionReason?: string;
    }) => {
      const response = await apiRequest(
        'PATCH', 
        `/api/property-approval/${propertyId}`, 
        { status, notes, rejectionReason }
      );
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/property-approval/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/property-approval/all'] });
      
      // Show success toast
      toast({
        title: variables.status === 'approved' ? '✅ Property Approved' : '❌ Property Rejected',
        description: variables.status === 'approved' 
          ? 'Property has been approved successfully'
          : 'Property has been rejected',
        variant: variables.status === 'approved' ? "default" : "destructive",
      });
      
      // Close dialogs
      setIsConfirmDialogOpen(false);
      setIsDetailsDialogOpen(false);
      setApprovalNotes('');
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast({
        title: 'Approval Error',
        description: error.message || 'Failed to process approval',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation to delete a single property
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      const response = await apiRequest('DELETE', `/api/property-approval/${propertyId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/property-approval/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/property-approval/all'] });
      toast({
        title: '🗑️ Property Deleted',
        description: 'Property has been deleted successfully',
      });
      setIsDetailsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete property',
        variant: 'destructive',
      });
    },
  });

  // Bulk approval mutation
  const bulkApproveMutation = useMutation({
    mutationFn: async ({ propertyIds, action, notes, rejectionReason }: { propertyIds: number[], action: 'approve' | 'reject', notes?: string, rejectionReason?: string }) => {
      const response = await apiRequest('PATCH', '/api/property-approval/bulk', {
        propertyIds,
        action,
        notes,
        rejectionReason
      });
      return response.json();
    },
    onSuccess: (data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/property-approval/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/property-approval/all'] });
      toast({
        title: `Bulk ${action === 'approve' ? 'Approval' : 'Rejection'} Complete`,
        description: `Successfully ${action === 'approve' ? 'approved' : 'rejected'} ${selectedProperties.size} properties`,
      });
      setSelectedProperties(new Set());
    },
    onError: (error: any) => {
      toast({
        title: 'Bulk Action Failed',
        description: error.message || 'Failed to complete bulk action',
        variant: 'destructive',
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (propertyIds: number[]) => {
      const response = await apiRequest('DELETE', '/api/property-approval/bulk', {
        propertyIds
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/property-approval/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/property-approval/all'] });
      toast({
        title: '🗑️ Bulk Delete Complete',
        description: `Successfully deleted ${selectedProperties.size} properties`,
      });
      setSelectedProperties(new Set());
    },
    onError: (error: any) => {
      toast({
        title: 'Bulk Delete Failed',
        description: error.message || 'Failed to delete properties',
        variant: 'destructive',
      });
    },
  });

  // Get the appropriate data based on active tab
  const getFilteredProperties = () => {
    let properties: PropertyApproval[] = [];
    
    if (activeTab === 'all') {
      properties = allPropertiesData?.properties || [];
    } else if (activeTab === 'properties') {
      properties = (allPropertiesData?.properties || []).filter((p: PropertyApproval) => p.status === 'pending_approval');
    } else {
      // For agents tab, return empty for now (can be implemented later)
      return [];
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      properties = properties.filter((p: PropertyApproval) => p.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      properties = properties.filter((p: PropertyApproval) => 
        p.title.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.propertyType.toLowerCase().includes(search)
      );
    }

    return properties;
  };

  const filteredProperties = getFilteredProperties();
  const isLoading = isLoadingPending || isLoadingAll;
  
  // Handle viewing property details
  const handleViewDetails = (property: PropertyApproval) => {
    setSelectedProperty(property);
    setIsDetailsDialogOpen(true);
  };
  
  // Handle property approval/rejection
  const handleApprovalAction = (action: 'approve' | 'reject') => {
    if (!selectedProperty) return;
    
    setApprovalAction(action);
    setIsConfirmDialogOpen(true);
  };
  
  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedProperties.size === filteredProperties?.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(filteredProperties?.map(p => p.id) || []));
    }
  };
  
  const handleSelectProperty = (propertyId: number) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId);
    } else {
      newSelected.add(propertyId);
    }
    setSelectedProperties(newSelected);
  };
  
  const handleBulkAction = (action: 'approve' | 'reject' | 'delete') => {
    if (selectedProperties.size === 0) return;
    
    let confirmMessage = '';
    switch (action) {
      case 'approve':
        confirmMessage = `Are you sure you want to approve ${selectedProperties.size} properties?`;
        break;
      case 'reject':
        confirmMessage = `Are you sure you want to reject ${selectedProperties.size} properties?`;
        break;
      case 'delete':
        confirmMessage = `Are you sure you want to delete ${selectedProperties.size} properties? This action cannot be undone.`;
        break;
    }
    
    if (confirm(confirmMessage)) {
      if (action === 'delete') {
        bulkDeleteMutation.mutate(Array.from(selectedProperties));
      } else {
        const notes = action === 'approve' ? 'Bulk approval' : undefined;
        const rejectionReason = action === 'reject' ? 'Bulk rejection' : undefined;
        bulkApproveMutation.mutate({ 
          propertyIds: Array.from(selectedProperties), 
          action, 
          notes,
          rejectionReason 
        });
      }
    }
  };

  // Handle individual delete
  const handleDelete = (property: PropertyApproval) => {
    const confirmMessage = `Are you sure you want to delete "${property.title}"? This action cannot be undone.`;
    if (confirm(confirmMessage)) {
      deletePropertyMutation.mutate(property.id);
    }
  };
  
  // Confirm approval/rejection
  const confirmApproval = () => {
    if (!selectedProperty) return;
    
    approvePropertyMutation.mutate({
      propertyId: selectedProperty.id,
      status: approvalAction,
      notes: approvalAction === 'approve' ? approvalNotes.trim() || undefined : undefined,
      rejectionReason: approvalAction === 'reject' ? rejectionReason.trim() || undefined : undefined,
    });
  };
  
  // Format timestamp
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending_approval':
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };
  
  // If not admin, show access denied
  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="p-4">
          <Card className="border-red-300">
            <CardHeader>
              <CardTitle className="text-red-700">🚫 Access Denied</CardTitle>
              <CardDescription>Administrator Access Required</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This area is restricted to administrators only. Property approvals can only be managed by admin users.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Contact your system administrator if you believe you should have access to this area.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <PageHeader
            title="Pending Approvals"
            description="Review and manage property and agent submissions"
          />
          
          <div className="flex items-center gap-4">
            {/* Add New Property Button */}
            <Button 
              onClick={() => window.open('/property/create', '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Property
            </Button>
            
            {/* Real-time Status Indicator */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Live Updates</span>
                  </>
                ) : hasError ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Connection Error</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={reconnect}
                      className="ml-2 h-6 px-2 text-xs"
                    >
                      Retry
                    </Button>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-600">Connecting...</span>
                  </>
                )}
              </div>
              {isConnected && (
                <Badge variant="outline" className="text-xs">
                  {connectedClients} connected
                </Badge>
              )}
              {eventCount > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  {eventCount} events
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Submissions</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
          </TabsList>

          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="pl-8 pr-4 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="pending_approval">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              {selectedProperties.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedProperties.size} selected
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleBulkAction('approve')}
                    disabled={bulkApproveMutation.isPending || bulkDeleteMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {bulkApproveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Bulk Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkAction('reject')}
                    disabled={bulkApproveMutation.isPending || bulkDeleteMutation.isPending}
                  >
                    {bulkApproveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <XCircle className="mr-1 h-3 w-3" />
                    Bulk Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('delete')}
                    disabled={bulkApproveMutation.isPending || bulkDeleteMutation.isPending}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {bulkDeleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Trash2 className="mr-1 h-3 w-3" />
                    Bulk Delete
                  </Button>
                </div>
              )}
            </div>
          </div>

          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {activeTab === 'properties' ? <Home className="h-5 w-5" /> : 
                   activeTab === 'agents' ? <Users className="h-5 w-5" /> : 
                   <FileCheck className="h-5 w-5" />}
                  Items Pending Approval
                </CardTitle>
                <CardDescription>
                  Review and manage property and agent submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading approvals...</p>
                  </div>
                ) : filteredProperties && filteredProperties.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <button
                              onClick={handleSelectAll}
                              className="flex items-center justify-center w-full"
                            >
                              {selectedProperties.size === filteredProperties?.length && filteredProperties?.length > 0 ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Submitted By</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProperties.map((property) => (
                          <TableRow key={property.id} className={selectedProperties.has(property.id) ? 'bg-muted/50' : ''}>
                            <TableCell>
                              <button
                                onClick={() => handleSelectProperty(property.id)}
                                className="flex items-center justify-center w-full"
                              >
                                {selectedProperties.has(property.id) ? (
                                  <CheckSquare className="h-4 w-4" />
                                ) : (
                                  <Square className="h-4 w-4" />
                                )}
                              </button>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                {property.images?.[0] && (
                                  <img 
                                    src={property.images[0]} 
                                    alt={property.title} 
                                    className="h-10 w-10 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{property.title}</p>
                                  <p className="text-xs text-gray-500">
                                    {property.currency} {property.price?.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {property.propertyType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p>{property.ownerName || 'Unknown Owner'}</p>
                                <p className="text-sm text-muted-foreground">{property.ownerEmail || 'No email'}</p>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(property.createdAt)}</TableCell>
                            <TableCell>{getStatusBadge(property.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(property)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(property)}
                                  disabled={deletePropertyMutation.isPending}
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  {deletePropertyMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                  {!deletePropertyMutation.isPending && <Trash2 className="h-4 w-4" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No pending approvals</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      All submissions have been reviewed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Details Dialog */}
        {selectedProperty && (
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Property Details - {selectedProperty.title}</DialogTitle>
                <DialogDescription>
                  Review and approve or reject this property submission
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  {selectedProperty.images?.[0] && (
                    <img 
                      src={selectedProperty.images[0]} 
                      alt={selectedProperty.title} 
                      className="h-16 w-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{selectedProperty.title}</h3>
                    <p className="text-sm text-gray-500">{selectedProperty.propertyType}</p>
                    <p className="text-sm font-medium">{selectedProperty.currency} {selectedProperty.price?.toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="font-semibold">Description</Label>
                  <p className="text-sm">{selectedProperty.description}</p>
                </div>

                <div>
                  <Label className="font-semibold">Submitted Date</Label>
                  <p>{formatDate(selectedProperty.createdAt)}</p>
                </div>
                
                <div>
                  <Label className="font-semibold">Status</Label>
                  <div>{getStatusBadge(selectedProperty.status)}</div>
                </div>
                
                <div>
                  <Label className="font-semibold">Location</Label>
                  <p className="text-sm">{selectedProperty.location?.address || 'No address provided'}</p>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <div className="flex justify-between w-full">
                  <Button 
                    variant="outline"
                    onClick={() => handleDelete(selectedProperty)}
                    disabled={deletePropertyMutation.isPending}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {deletePropertyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Property
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDetailsDialogOpen(false)}
                    >
                      Close
                    </Button>
                    {selectedProperty.status === 'pending_approval' && (
                      <>
                        <Button 
                          onClick={() => handleApprovalAction('approve')}
                          disabled={approvePropertyMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {approvePropertyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleApprovalAction('reject')}
                          disabled={approvePropertyMutation.isPending}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Confirmation Dialog for Approval/Rejection */}
        <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {approvalAction === 'approve' ? 'Approve Property' : 'Reject Property'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {approvalAction} this property submission?
                {selectedProperty && (
                  <div className="mt-2 text-sm">
                    <strong>Property:</strong> {selectedProperty.title}
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-4 py-4">
              {approvalAction === 'approve' ? (
                <div>
                  <Label htmlFor="approvalNotes">Approval Notes (Optional)</Label>
                  <Textarea 
                    id="approvalNotes"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add any notes about this approval..."
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason (Required)</Label>
                  <Textarea 
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmApproval}
                disabled={approvePropertyMutation.isPending || (approvalAction === 'reject' && !rejectionReason.trim())}
                className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {approvePropertyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {approvalAction === 'approve' ? 'Approve' : 'Reject'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}