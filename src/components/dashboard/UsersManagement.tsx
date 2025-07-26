import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Users,
  Check,
  Edit,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash,
  X,
  Edit2,
  Shield,
  ShieldOff,
  UserX,
  UserCheck,
  Crown,
  Ban,
  RotateCcw,
  Settings
} from "lucide-react";
import { UserService } from "@/lib/user-service";

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
  status?: 'active' | 'suspended' | 'inactive';
  createdAt: Date;
  agencyId?: number;
  agencyName?: string;
  isVerified: boolean | null;
  verificationType?: 'user' | 'agency' | null;
  verificationMethod?: string | null;
  verifiedAt?: Date | null;
  subscriptionTier?: 'free' | 'premium' | 'enterprise';
}

interface BulkEditData {
  role?: 'user' | 'agent' | 'admin';
  status?: 'active' | 'suspended' | 'inactive';
  isVerified?: boolean;
  subscriptionTier?: 'free' | 'premium' | 'enterprise';
}

export default function UsersManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['dashboard', 'common']);

  // State management
  const [selectMode, setSelectMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkActivateOpen, setBulkActivateOpen] = useState(false);
  const [bulkSuspendOpen, setBulkSuspendOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<BulkEditData>({});

  // Only allow admin access
  if (!user || user.role !== 'admin') {
    return (
      <Card className="border-red-300">
        <CardHeader>
          <CardTitle className="text-red-700">Access Denied</CardTitle>
          <CardDescription>This area is restricted to administrators.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>You do not have the necessary permissions to view this page.</p>
        </CardContent>
      </Card>
    );
  }

  // Fetch users
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['admin-users', searchTerm, roleFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('query', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const users = usersData?.users || [];

  // Bulk edit mutation
  const bulkEditMutation = useMutation({
    mutationFn: async (data: { userIds: number[]; updates: BulkEditData }) => {
      const response = await fetch('/api/admin/users/bulk-edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update users');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Users Updated",
        description: `${selectedUsers.length} users have been updated successfully.`,
      });
      setBulkEditOpen(false);
      setSelectedUsers([]);
      setSelectMode(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update users. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (userIds: number[]) => {
      const response = await fetch('/api/admin/users/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete users');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Users Deleted",
        description: `${selectedUsers.length} users have been deleted successfully.`,
      });
      setBulkDeleteOpen(false);
      setSelectedUsers([]);
      setSelectMode(false);
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete users. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bulk status change mutations
  const bulkStatusMutation = useMutation({
    mutationFn: async (data: { userIds: number[]; status: 'active' | 'suspended' }) => {
      const response = await fetch('/api/admin/users/bulk-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update user status');
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      const action = variables.status === 'active' ? 'activated' : 'suspended';
      toast({
        title: `Users ${action}`,
        description: `${selectedUsers.length} users have been ${action} successfully.`,
      });
      setBulkActivateOpen(false);
      setBulkSuspendOpen(false);
      setSelectedUsers([]);
      setSelectMode(false);
    },
    onError: (error) => {
      toast({
        title: "Status Update Failed",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter users
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Selection handlers
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  // Bulk operations
  const handleBulkEdit = () => {
    if (selectedUsers.length === 0) return;
    setBulkEditOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return;
    setBulkDeleteOpen(true);
  };

  const handleBulkActivate = () => {
    if (selectedUsers.length === 0) return;
    setBulkActivateOpen(true);
  };

  const handleBulkSuspend = () => {
    if (selectedUsers.length === 0) return;
    setBulkSuspendOpen(true);
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
      userIds: selectedUsers,
      updates: cleanData,
    });
  };

  const executeBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedUsers);
  };

  const executeBulkActivate = () => {
    bulkStatusMutation.mutate({
      userIds: selectedUsers,
      status: 'active',
    });
  };

  const executeBulkSuspend = () => {
    bulkStatusMutation.mutate({
      userIds: selectedUsers,
      status: 'suspended',
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800"><Crown className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'agent':
        return <Badge className="bg-blue-100 text-blue-800"><Shield className="h-3 w-3 mr-1" />Agent</Badge>;
      case 'user':
        return <Badge variant="outline">User</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const allSelected = filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length;

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
          <h2 className="text-2xl font-bold tracking-tight">Users Management</h2>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          {selectMode ? (
            <>
              <Button variant="outline" onClick={toggleSelectMode}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button variant="outline" onClick={selectAllUsers}>
                <Check className="mr-2 h-4 w-4" />
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
              {selectedUsers.length > 0 && (
                <>
                  <Button variant="outline" onClick={handleBulkEdit}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit ({selectedUsers.length})
                  </Button>
                  <Button variant="outline" onClick={handleBulkActivate} className="text-green-600">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate ({selectedUsers.length})
                  </Button>
                  <Button variant="outline" onClick={handleBulkSuspend} className="text-amber-600">
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend ({selectedUsers.length})
                  </Button>
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete ({selectedUsers.length})
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button onClick={toggleSelectMode} variant="outline">
                <Check className="mr-2 h-4 w-4" /> Select Multiple
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800">
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Button>
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
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="role">Filter by Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
          <CardDescription>
            {filteredUsers.length} users found
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
                        onCheckedChange={selectAllUsers}
                        aria-label="Select all users"
                      />
                    </TableHead>
                  )}
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user: User) => (
                    <TableRow 
                      key={user.id} 
                      className={selectedUsers.includes(user.id) ? "bg-muted/50" : ""}
                    >
                      {selectMode && (
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                            aria-label={`Select ${user.fullName}`}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">@{user.username}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        {user.isVerified ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <ShieldOff className="h-3 w-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.agencyName || (
                          <span className="text-gray-400 text-sm">No agency</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? format(new Date(user.createdAt), 'PPP') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
                      colSpan={selectMode ? 8 : 7} 
                      className="text-center py-8 text-muted-foreground"
                    >
                      No users found
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
            <DialogTitle>Bulk Edit Users</DialogTitle>
            <DialogDescription>
              Edit {selectedUsers.length} selected users. Leave fields empty to keep current values.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={bulkEditData.role || ""}
                  onValueChange={(value) => setBulkEditData(prev => ({ 
                    ...prev, 
                    role: value as 'user' | 'agent' | 'admin' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={bulkEditData.status || ""}
                  onValueChange={(value) => setBulkEditData(prev => ({ 
                    ...prev, 
                    status: value as 'active' | 'suspended' | 'inactive' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
                    <SelectValue placeholder="Select verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Subscription Tier</Label>
                <Select 
                  value={bulkEditData.subscriptionTier || ""}
                  onValueChange={(value) => setBulkEditData(prev => ({ 
                    ...prev, 
                    subscriptionTier: value as 'free' | 'premium' | 'enterprise' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
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
              Update Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUsers.length} selected users? 
              This action cannot be undone and will remove all user data.
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
              Delete Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Activate Dialog */}
      <AlertDialog open={bulkActivateOpen} onOpenChange={setBulkActivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate {selectedUsers.length} selected users?
              This will restore their access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkStatusMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkActivate}
              disabled={bulkStatusMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {bulkStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Activate Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Suspend Dialog */}
      <AlertDialog open={bulkSuspendOpen} onOpenChange={setBulkSuspendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend {selectedUsers.length} selected users?
              This will restrict their access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkStatusMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkSuspend}
              disabled={bulkStatusMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {bulkStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Suspend Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}