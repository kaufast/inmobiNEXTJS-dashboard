import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle, XCircle, Clock, Eye, FileText, 
  Search, Filter, MoreVertical, AlertTriangle,
  TrendingUp, Users, Building, MapPin
} from "lucide-react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, formatDistanceToNow } from "date-fns";

interface Property {
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
  location?: any;
  images?: string[];
}

interface ApprovalStats {
  total: {
    pending: number;
    approved: number;
    rejected: number;
  };
  user?: {
    pending: number;
    approved: number;
  };
}

export function PropertyApprovalDashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Form states
  const [approvalForm, setApprovalForm] = useState({
    status: "" as "approved" | "rejected",
    notes: "",
    rejectionReason: "",
  });

  const [bulkForm, setBulkForm] = useState({
    action: "" as "approve" | "reject",
    notes: "",
    rejectionReason: "",
  });

  // Fetch approval statistics
  const { data: approvalStats } = useQuery({
    queryKey: ['property-approval-stats'],
    queryFn: async () => {
      const response = await fetch('/api/property-approval/stats', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  // Fetch pending properties
  const { data: pendingProperties, isLoading: loadingPending } = useQuery({
    queryKey: ['pending-properties', currentPage, searchTerm, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/property-approval/pending?${params}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch pending properties');
      return response.json();
    },
  });

  // Fetch all properties for admin view
  const { data: allProperties, isLoading: loadingAll } = useQuery({
    queryKey: ['all-properties', currentPage, statusFilter, searchTerm, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder,
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/property-approval/all?${params}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
    enabled: activeTab === 'all',
  });

  // Single property approval mutation
  const approvePropertyMutation = useMutation({
    mutationFn: async ({ propertyId, data }: { propertyId: number; data: typeof approvalForm }) => {
      const response = await fetch(`/api/property-approval/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update property');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-properties'] });
      queryClient.invalidateQueries({ queryKey: ['all-properties'] });
      queryClient.invalidateQueries({ queryKey: ['property-approval-stats'] });
      toast({
        title: "Property Updated",
        description: `Property ${approvalForm.status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });
      setShowApprovalDialog(false);
      setSelectedProperty(null);
      setApprovalForm({ status: "" as any, notes: "", rejectionReason: "" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      });
    },
  });

  // Bulk approval mutation
  const bulkApprovalMutation = useMutation({
    mutationFn: async (data: typeof bulkForm & { propertyIds: number[] }) => {
      const response = await fetch('/api/property-approval/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to bulk update properties');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pending-properties'] });
      queryClient.invalidateQueries({ queryKey: ['all-properties'] });
      queryClient.invalidateQueries({ queryKey: ['property-approval-stats'] });
      toast({
        title: "Bulk Update Successful",
        description: `${data.updated} properties updated successfully`,
      });
      setShowBulkDialog(false);
      setSelectedProperties([]);
      setBulkForm({ action: "" as any, notes: "", rejectionReason: "" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to bulk update properties",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    }
  };

  const handleSingleApproval = (property: Property, status: "approved" | "rejected") => {
    setSelectedProperty(property);
    setApprovalForm({ status, notes: "", rejectionReason: "" });
    setShowApprovalDialog(true);
  };

  const handleBulkAction = (action: "approve" | "reject") => {
    if (selectedProperties.length === 0) {
      toast({
        title: "No Properties Selected",
        description: "Please select properties to perform bulk action",
        variant: "destructive",
      });
      return;
    }
    setBulkForm({ action, notes: "", rejectionReason: "" });
    setShowBulkDialog(true);
  };

  const handlePropertySelection = (propertyId: number, checked: boolean) => {
    if (checked) {
      setSelectedProperties([...selectedProperties, propertyId]);
    } else {
      setSelectedProperties(selectedProperties.filter(id => id !== propertyId));
    }
  };

  const handleSelectAll = (properties: Property[], checked: boolean) => {
    if (checked) {
      const propertyIds = properties.map(p => p.id);
      setSelectedProperties([...new Set([...selectedProperties, ...propertyIds])]);
    } else {
      const propertyIds = properties.map(p => p.id);
      setSelectedProperties(selectedProperties.filter(id => !propertyIds.includes(id)));
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  // Check if user has approval permissions
  const canApprove = user?.role === 'admin' || 
                    user?.role === 'agency_premium' || 
                    user?.role === 'agent_superuser';

  if (!canApprove) {
    return (
      <Card className="border-yellow-300 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Insufficient Permissions
          </CardTitle>
          <CardDescription className="text-yellow-700">
            Only administrators and premium users can manage property approvals.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {approvalStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {approvalStats.total.pending}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {approvalStats.total.approved}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {approvalStats.total.rejected}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {approvalStats.total.pending + approvalStats.total.approved + approvalStats.total.rejected}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Approval ({approvalStats?.total.pending || 0})</TabsTrigger>
          <TabsTrigger value="all">All Properties</TabsTrigger>
        </TabsList>

        {/* Pending Properties Tab */}
        <TabsContent value="pending" className="space-y-4">
          {/* Bulk Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleBulkAction('approve')}
                disabled={selectedProperties.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Bulk Approve ({selectedProperties.length})
              </Button>
              <Button
                onClick={() => handleBulkAction('reject')}
                disabled={selectedProperties.length === 0}
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Bulk Reject ({selectedProperties.length})
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          {/* Properties Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={pendingProperties?.properties.length > 0 && 
                                selectedProperties.length === pendingProperties.properties.length}
                        onCheckedChange={(checked) => 
                          pendingProperties && handleSelectAll(pendingProperties.properties, checked as boolean)
                        }
                      />
                    </TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingPending ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}>
                          <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    pendingProperties?.properties.map((property: Property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedProperties.includes(property.id)}
                            onCheckedChange={(checked) => 
                              handlePropertySelection(property.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{property.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {property.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {property.propertyType?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(property.price, property.currency)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDistanceToNow(new Date(property.createdAt), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleSingleApproval(property, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSingleApproval(property, 'rejected')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View History
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Properties Tab */}
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_approval">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          {/* Properties Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingAll ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}>
                          <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    allProperties?.properties.map((property: Property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{property.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {property.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {property.propertyType?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(property.price, property.currency)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(property.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDistanceToNow(new Date(property.createdAt), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                View History
                              </DropdownMenuItem>
                              {property.status === 'pending_approval' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleSingleApproval(property, 'approved')}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSingleApproval(property, 'rejected')}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Single Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalForm.status === 'approved' ? 'Approve' : 'Reject'} Property
            </DialogTitle>
            <DialogDescription>
              {approvalForm.status === 'approved' 
                ? 'This property will be approved and visible to users.'
                : 'This property will be rejected and hidden from users.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedProperty.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedProperty.description}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={approvalForm.notes}
                  onChange={(e) => setApprovalForm({...approvalForm, notes: e.target.value})}
                  placeholder="Add any notes about this decision..."
                />
              </div>

              {approvalForm.status === 'rejected' && (
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                  <Textarea
                    id="rejection-reason"
                    value={approvalForm.rejectionReason}
                    onChange={(e) => setApprovalForm({...approvalForm, rejectionReason: e.target.value})}
                    placeholder="Explain why this property is being rejected..."
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedProperty && approvePropertyMutation.mutate({
                propertyId: selectedProperty.id,
                data: approvalForm
              })}
              disabled={approvePropertyMutation.isPending}
              className={approvalForm.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={approvalForm.status === 'rejected' ? 'destructive' : 'default'}
            >
              {approvalForm.status === 'approved' ? 'Approve' : 'Reject'} Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Bulk {bulkForm.action === 'approve' ? 'Approve' : 'Reject'} Properties
            </DialogTitle>
            <DialogDescription>
              You are about to {bulkForm.action} {selectedProperties.length} properties.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-notes">Notes (optional)</Label>
              <Textarea
                id="bulk-notes"
                value={bulkForm.notes}
                onChange={(e) => setBulkForm({...bulkForm, notes: e.target.value})}
                placeholder="Add any notes about this bulk action..."
              />
            </div>

            {bulkForm.action === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="bulk-rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="bulk-rejection-reason"
                  value={bulkForm.rejectionReason}
                  onChange={(e) => setBulkForm({...bulkForm, rejectionReason: e.target.value})}
                  placeholder="Explain why these properties are being rejected..."
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => bulkApprovalMutation.mutate({
                ...bulkForm,
                propertyIds: selectedProperties
              })}
              disabled={bulkApprovalMutation.isPending}
              className={bulkForm.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={bulkForm.action === 'reject' ? 'destructive' : 'default'}
            >
              {bulkForm.action === 'approve' ? 'Approve' : 'Reject'} {selectedProperties.length} Properties
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}