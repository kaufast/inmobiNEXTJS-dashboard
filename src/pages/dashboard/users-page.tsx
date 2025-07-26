import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertCircle,
  Check,
  Plus,
  FileText,
  MoreHorizontal,
  Edit,
  RefreshCcw,
  RotateCcw,
  Search,
  Shield,
  ShieldOff,
  Trash,
  User,
  Users,
  Home,
  Loader2 as Loader
} from 'lucide-react';
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { 
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { UserService } from "@/lib/user-service";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { route } from "@/lib/route";
import { format } from "date-fns";
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
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import UsersManagement from "@/components/dashboard/UsersManagement";
import { ReportIssueButton } from "@/components/common/ReportIssueButton";

// Agency interface
interface Agency {
  id: number;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  licenseNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  logo?: string;
  verified: boolean;
  memberCount: number;
  createdAt: string;
}

// User interface with agency info
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
}

interface UsersResponse {
  users: User[];
  total: number;
}

interface AgenciesResponse {
  agencies: Agency[];
  total: number;
}

// Define interfaces for form states
interface NewUserFormState {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'user' | 'agent' | 'admin';
  agencyId: string;
  subscriptionTier: string;
  preferredLanguage: string;
}

interface EditUserFormState {
  role: 'user' | 'agent' | 'admin';
  status: 'active' | 'suspended' | 'inactive';
  fullName: string;
  email: string;
  agencyId: string;
}

export default function UsersPage() {
  const { t } = useTranslation(['dashboard', 'common', 'verification']);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('users');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isCreateAgencyDialogOpen, setIsCreateAgencyDialogOpen] = useState<boolean>(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [bulkActionMode, setBulkActionMode] = useState<boolean>(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState<boolean>(false);
  const [newUserData, setNewUserData] = useState<NewUserFormState>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'user',
    agencyId: '',
    subscriptionTier: 'free',
    preferredLanguage: 'en'
  });
  const [newAgencyData, setNewAgencyData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    licenseNumber: '',
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
    adminUser: {
      fullName: '',
      email: '',
      password: ''
    },
    termsAccepted: false
  });
  const [editUserData, setEditUserData] = useState<EditUserFormState>({
    role: 'user',
    status: 'inactive',
    fullName: '',
    email: '',
    agencyId: ''
  });

  if (!user) {
    return null;
  }

  // If user is not admin, render access denied message
  if (user.role !== 'admin') {
    return (
      <DashboardLayout>
        <Helmet>
          <title>{t('common:global.accessDenied')} | {t('common:inMobi')}</title>
        </Helmet>
        <div className="p-6">
          <Card className="border-red-300">
            <CardHeader>
              <CardTitle className="text-red-700">{t('common:global.accessDenied')}</CardTitle>
              <CardDescription>{t('users.adminOnly', {defaultValue: 'This area is restricted to administrators.'})}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t('users.noPermission', {defaultValue: 'You do not have the necessary permissions to view this page.'})}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setLocation(route('/dashboard'))}>
                {t('common:global.goBack')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Fetch users with filters
  const { data: usersData, isLoading: isUsersLoading } = useQuery<UsersResponse>({
    queryKey: ["users", { query: searchQuery, role: roleFilter, status: statusFilter }],
    queryFn: () => UserService.getUsers({
      query: searchQuery,
      role: roleFilter === 'all' ? undefined : roleFilter,
      status: statusFilter === 'all' ? undefined : statusFilter
    })
  });

  // Fetch agencies
  const { data: agenciesData, isLoading: isAgenciesLoading } = useQuery<AgenciesResponse>({
    queryKey: ["agencies"],
    queryFn: () => UserService.getAgencies()
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: NewUserFormState) => {
      const { agencyId: formAgencyId, ...restOfData } = data;
      const apiPayload = {
        ...restOfData,
        agencyId: formAgencyId === 'none' || formAgencyId === '' ? null : parseInt(formAgencyId, 10),
      };
      return UserService.createUser(apiPayload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: t('users.createSuccess'),
        description: t('users.createSuccessMessage')
      });
      setIsCreateDialogOpen(false);
      setNewUserData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        role: 'user',
        agencyId: '',
        subscriptionTier: 'free',
        preferredLanguage: 'en'
      });
    },
    onError: (error: any) => {
      toast({
        title: t('users.createError'),
        description: error.response?.data?.message || t('common:general.error')
      });
    }
  });

  // Create agency mutation
  const createAgencyMutation = useMutation({
    mutationFn: (data: typeof newAgencyData) => UserService.createAgency(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAgencies'] });
      setIsCreateAgencyDialogOpen(false);
      setNewAgencyData({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        licenseNumber: '',
        phone: '',
        email: '',
        website: '',
        logoUrl: '',
        adminUser: {
          fullName: '',
          email: '',
          password: ''
        },
        termsAccepted: false
      });
      toast({
        title: t('users.agencies.createSuccess'),
        description: t('users.agencies.createSuccessMessage')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('users.agencies.createError'),
        description: error.response?.data?.message || t('common:general.error')
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: { id: number; userData: Partial<User> }) => 
      UserService.updateUser(data.id, data.userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setIsEditUserDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: t('users.updateSuccess'),
        description: t('users.updateSuccessMessage')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('users.updateError'),
        description: error.response?.data?.message || t('common:general.error')
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => UserService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setIsDeleteConfirmOpen(false);
      setSelectedUser(null);
      toast({
        title: t('users.deleteSuccess'),
        description: t('users.deleteSuccessMessage')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('users.deleteError'),
        description: error.response?.data?.message || t('common:general.error')
      });
    }
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: (userId: number) => UserService.suspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: t('users.suspendSuccess'),
        description: t('users.suspendSuccessMessage')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('users.suspendError'),
        description: error.response?.data?.message || t('common:general.error')
      });
    }
  });

  // Reactivate user mutation
  const reactivateUserMutation = useMutation({
    mutationFn: (userId: number) => UserService.reactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: t('users.reactivateSuccess'),
        description: t('users.reactivateSuccessMessage')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('users.reactivateError'),
        description: error.response?.data?.message || t('common:general.error')
      });
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (userId: number) => {
      // TODO: Implement a proper UI for admin to set/generate a new password.
      const tempNewPassword = `TempP@ss${Math.random().toString(36).substring(2, 10)}`;
      return UserService.resetPassword(userId, tempNewPassword);
    },
    onSuccess: () => {
      toast({
        title: t('verification:forgotPassword.success'),
        description: t('users.resetPasswordSuccessMessage')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('users.resetPasswordError'),
        description: error.response?.data?.message || t('common:general.error')
      });
    }
  });

  // Bulk mutations
  const bulkDeleteMutation = useMutation({
    mutationFn: (userIds: number[]) => UserService.bulkDeleteUsers(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: t('users.deleteSuccess'),
        description: t('users.deleteSuccessMessage')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('users.deleteError'),
        description: error.message || t('common:general.error')
      });
    }
  });

  const bulkSuspendMutation = useMutation({
    mutationFn: (userIds: number[]) => UserService.bulkSuspendUsers(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: t('users.suspendSuccess'),
        description: t('users.suspendSuccessMessage')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('users.suspendError'),
        description: error.message || t('common:general.error')
      });
    }
  });

  const bulkReactivateMutation = useMutation({
    mutationFn: (userIds: number[]) => UserService.bulkReactivateUsers(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: t('users.reactivateSuccess'),
        description: t('users.reactivateSuccessMessage')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('users.reactivateError'),
        description: error.message || t('common:general.error')
      });
    }
  });

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 border-red-300"><span className="inline-block mr-1"><Shield size={12} /></span> {t('users.roles.admin')}</Badge>;
      case 'agent':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300"><span className="inline-block mr-1"><Home size={12} /></span> {t('users.roles.agent')}</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800 border-green-300"><span className="inline-block mr-1"><User size={12} /></span> {t('users.roles.user')}</Badge>;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300"><span className="inline-block mr-1"><Check size={12} /></span> {t('users.statuses.active')}</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-red-300"><span className="inline-block mr-1"><AlertCircle size={12} /></span> {t('users.statuses.suspended')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{t('users.statuses.inactive')}</Badge>;
    }
  };

  const getVerificationBadge = (user: User) => {
    if (user.isVerified) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
          <span className="inline-block mr-1"><Shield size={12} /></span>
          {user.verificationType === 'agency' ? t('users_verification_agency') : t('users_verification_user')}
        </Badge>
      );
    }
    return null;
  };

  const handleCreateUser = (e: FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(newUserData);
  };

  const handleCreateAgency = (e: FormEvent) => {
    e.preventDefault();
    createAgencyMutation.mutate(newAgencyData);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUserData({
      role: user.role,
      status: user.status || 'inactive',
      fullName: user.fullName,
      email: user.email,
      agencyId: user.agencyId?.toString() || 'none'
    });
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const { agencyId: formAgencyId, role, status, fullName, email } = editUserData;

    const agencyIdValue = formAgencyId === 'none' || formAgencyId === '' ? undefined : parseInt(formAgencyId, 10);
    
    const userDataToUpdate: Partial<User> = {
      fullName,
      email,
      role, 
      status, 
      agencyId: agencyIdValue,
    };
    
    updateUserMutation.mutate({
      id: selectedUser.id,
      userData: userDataToUpdate
    });
  };

  const handleDeleteConfirm = (user: User) => {
    setSelectedUser(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser.id);
  };

  const handleSuspendUser = (userId: number) => {
    suspendUserMutation.mutate(userId);
  };

  const handleReactivateUser = (userId: number) => {
    reactivateUserMutation.mutate(userId);
  };

  const handleResetPassword = (userId: number) => {
    resetPasswordMutation.mutate(userId);
  };

  // Bulk action handlers
  const toggleBulkActionMode = () => {
    setBulkActionMode(!bulkActionMode);
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
    if (selectedUsers.length === (usersData?.users.length || 0)) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(usersData?.users.map(u => u.id) || []);
    }
  };

  const handleBulkSuspend = () => {
    if (selectedUsers.length === 0) return;
    bulkSuspendMutation.mutate([...selectedUsers]);
    setSelectedUsers([]);
    setBulkActionMode(false);
  };

  const handleBulkReactivate = () => {
    if (selectedUsers.length === 0) return;
    bulkReactivateMutation.mutate([...selectedUsers]);
    setSelectedUsers([]);
    setBulkActionMode(false);
  };

  const handleBulkResetPassword = () => {
    if (selectedUsers.length === 0) return;
    selectedUsers.forEach(userId => handleResetPassword(userId));
    setSelectedUsers([]);
    setBulkActionMode(false);
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return;
    setIsBulkDeleteConfirmOpen(true);
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedUsers.length === 0) return;
    
    // Store selected users before clearing state
    const usersToDelete = [...selectedUsers];
    
    // Use bulk delete mutation
    bulkDeleteMutation.mutate(usersToDelete);
    
    setSelectedUsers([]);
    setBulkActionMode(false);
    setIsBulkDeleteConfirmOpen(false);
  };

  const renderPageContent = () => {
  return (
      <>
        <Helmet>
          <title>{t('users.title')} | {t('common:inMobi')}</title>
        </Helmet>
        <div className="p-4 md:p-6">
          <PageHeader title={t('users.title')} description={t('users.description')} />
          
          <div className="mb-4 flex justify-between items-center">
            <div className="flex gap-2">
              {/* Bulk actions moved to below card description */}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsCreateDialogOpen(true)}>{t('users.create')}</Button>
              <Button onClick={() => setIsCreateAgencyDialogOpen(true)} variant="outline">{t('users.agencies.create')}</Button>
            </div>
          </div>

        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">{t('users.tabs.users')}</TabsTrigger>
            <TabsTrigger value="agencies">{t('users.tabs.agencies')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>{t('users.list')}</CardTitle>
                <CardDescription>{t('users.listDescription')}</CardDescription>
                {/* Bulk action buttons below description */}
                {bulkActionMode && selectedUsers.length > 0 && (
                  <div className="flex gap-2 mt-4 mb-2">
                    <Button 
                      variant="outline" 
                      onClick={handleBulkSuspend}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      <AlertCircle size={16} className="mr-2" />
                      {t('users.suspend')} ({selectedUsers.length})
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleBulkReactivate}
                      className="text-green-600 hover:text-green-700"
                    >
                      <RefreshCcw size={16} className="mr-2" />
                      {t('users.reactivate')} ({selectedUsers.length})
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleBulkResetPassword}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <RotateCcw size={16} className="mr-2" />
                      {t('users.resetPassword')} ({selectedUsers.length})
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleBulkDelete}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash size={16} className="mr-2" />
                      {t('users.delete')} ({selectedUsers.length})
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                      <span className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground">
                        <Search size="100%" />
                      </span>
                    <Input
                      placeholder={t('users.search')}
                      value={searchQuery}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                      className="pl-8 w-full"
                    />
                  </div>
                  {/* Bulk actions toggle always visible */}
                  <Button 
                    variant="outline" 
                    onClick={toggleBulkActionMode}
                    className={bulkActionMode ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}
                  >
                    <Check size={16} className="mr-2" />
                    {bulkActionMode ? "Cancel Bulk Actions" : "Bulk Actions"}
                  </Button>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('users.filterByRole')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('users.allRoles')}</SelectItem>
                      <SelectItem value="user">{t('users.roles.user')}</SelectItem>
                      <SelectItem value="agent">{t('users.roles.agent')}</SelectItem>
                      <SelectItem value="admin">{t('users.roles.admin')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('users.filterByStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('users.allStatuses')}</SelectItem>
                      <SelectItem value="active">{t('users.statuses.active')}</SelectItem>
                      <SelectItem value="suspended">{t('users.statuses.suspended')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isUsersLoading ? (
                  <div className="flex justify-center items-center h-64">
                      <span className="animate-spin"><Loader size={32} /></span>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {bulkActionMode && (
                            <TableHead className="w-[50px]">
                              <Checkbox
                                checked={selectedUsers.length === (usersData?.users.length || 0) && (usersData?.users.length || 0) > 0}
                                onCheckedChange={selectAllUsers}
                                aria-label="Select all users"
                              />
                            </TableHead>
                          )}
                          <TableHead>{t('users.username')}</TableHead>
                          <TableHead>{t('users.fullName')}</TableHead>
                          <TableHead>{t('users.email')}</TableHead>
                          <TableHead>{t('users.role')}</TableHead>
                          <TableHead>{t('users.agency')}</TableHead>
                          <TableHead>{t('users.status')}</TableHead>
                          <TableHead>{t('users.joined')}</TableHead>
                          <TableHead>{t('users.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersData && usersData.users.length > 0 ? (
                          usersData.users.map((user: User) => (
                            <TableRow 
                              key={user.id}
                              className={selectedUsers.includes(user.id) ? "bg-muted/50" : ""}
                            >
                              {bulkActionMode && (
                                <TableCell>
                                  <Checkbox
                                    checked={selectedUsers.includes(user.id)}
                                    onCheckedChange={() => toggleUserSelection(user.id)}
                                    aria-label={`Select ${user.fullName}`}
                                  />
                                </TableCell>
                              )}
                              <TableCell className="font-medium">{user.username}</TableCell>
                              <TableCell>{user.fullName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                {getRoleBadge(user.role)}
                                {user.isVerified && (
                                  <span className="ml-2">{getVerificationBadge(user)}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {user.agencyName ? (
                                  <Badge variant="outline" className="bg-gray-100">
                                      <span className="mr-1"><Home size={12} /></span>
                                    {user.agencyName}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell>{getStatusBadge(user.status)}</TableCell>
                              <TableCell>
                                {user.createdAt ? format(new Date(user.createdAt), 'PPP') : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {/* Quick Action Buttons */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditUser(user)}
                                    className="h-8 px-2"
                                  >
                                    <Edit size={14} />
                                  </Button>
                                  
                                  {user.status === 'active' ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSuspendUser(user.id)}
                                      className="h-8 px-2 text-amber-600 hover:text-amber-700"
                                    >
                                      <AlertCircle size={14} />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleReactivateUser(user.id)}
                                      className="h-8 px-2 text-green-600 hover:text-green-700"
                                    >
                                      <RefreshCcw size={14} />
                                    </Button>
                                  )}
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResetPassword(user.id)}
                                    className="h-8 px-2 text-blue-600 hover:text-blue-700"
                                  >
                                    <RotateCcw size={14} />
                                  </Button>
                                  
                                  {/* Dropdown for additional actions */}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal size={16} />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>{t('users.actions')}</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                        <span className="mr-2"><Edit size={16} /></span>
                                        {t('users.edit')}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleResetPassword(user.id)}
                                        className="text-blue-600"
                                      >
                                        <span className="mr-2"><RotateCcw size={16} /></span>
                                        {t('users.resetPassword')}
                                      </DropdownMenuItem>
                                      {user.status === 'active' ? (
                                        <DropdownMenuItem
                                          onClick={() => handleSuspendUser(user.id)}
                                          className="text-amber-600"
                                        >
                                          <span className="mr-2"><AlertCircle size={16} /></span>
                                          {t('users.suspend')}
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem
                                          onClick={() => handleReactivateUser(user.id)}
                                          className="text-green-600"
                                        >
                                          <span className="mr-2"><RefreshCcw size={16} /></span>
                                          {t('users.reactivate')}
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteConfirm(user)}
                                        className="text-red-600"
                                      >
                                        <span className="mr-2"><Trash size={16} /></span>
                                        {t('users.delete')}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={bulkActionMode ? 9 : 8} className="h-24 text-center">
                              <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                                  <FileText size={32} />
                                <p>{t('users.noUsersFound')}</p>
                                <p className="text-sm">{t('users.adjustFilters')}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="agencies">
            <Card>
              <CardHeader>
                <CardTitle>{t('users.agencies.title')}</CardTitle>
                <CardDescription>{t('users.agencies.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isAgenciesLoading ? (
                  <div className="flex justify-center items-center h-64">
                      <span className="animate-spin"><Loader size={32} /></span>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('users.agencies.name')}</TableHead>
                          <TableHead>{t('users.agencies.location')}</TableHead>
                          <TableHead>{t('users.agencies.contact')}</TableHead>
                          <TableHead>{t('users.agencies.agents')}</TableHead>
                          <TableHead>{t('users.agencies.license')}</TableHead>
                          <TableHead>{t('users.agencies.status')}</TableHead>
                          <TableHead className="text-right">{t('users.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agenciesData && agenciesData.agencies.length > 0 ? (
                          agenciesData.agencies.map((agency: Agency) => (
                            <TableRow key={agency.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground"><Home size={12} /></span>
                                  {agency.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                {agency.city && agency.country ? (
                                  `${agency.city}, ${agency.country}`
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {agency.contactEmail || <span className="text-muted-foreground text-sm">-</span>}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {agency.memberCount} {t('users.agencies.agentCount')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {agency.licenseNumber || <span className="text-muted-foreground text-sm">-</span>}
                              </TableCell>
                              <TableCell>
                                {agency.verified ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-300">
                                      <span className="mr-1"><Shield size={12} /></span>
                                    {t('users.agencies.verified')}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                                    {t('users.agencies.unverified')}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal size={16} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>{t('users.actions')}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <span className="mr-2"><Edit size={16} /></span>
                                      {t('users.agencies.edit')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <span className="mr-2"><Users size={16} /></span>
                                      {t('users.agencies.viewAgents')}
                                    </DropdownMenuItem>
                                    {!agency.verified ? (
                                      <DropdownMenuItem className="text-green-600">
                                          <span className="mr-2"><Shield size={16} /></span>
                                        {t('users.agencies.verify')}
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem className="text-amber-600">
                                          <span className="mr-2"><AlertCircle size={16} /></span>
                                        {t('users.agencies.unverify')}
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                        <span className="mr-2"><Trash size={16} /></span>
                                      {t('users.agencies.delete')}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                                  <Home size={32} />
                                <p>{t('users.agencies.noAgenciesFound')}</p>
                                <Button 
                                  variant="outline"
                                  onClick={() => setIsCreateAgencyDialogOpen(true)}
                                >
                                  {t('users.agencies.create')}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('users.edit')}</DialogTitle>
              <DialogDescription>
                {t('users.editDescription')}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-fullName">{t('users.fullName')}</Label>
                    <Input
                      id="edit-fullName"
                      name="fullName"
                      value={editUserData.fullName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => 
                        setEditUserData((prev) => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">{t('users.email')}</Label>
                    <Input
                      id="edit-email"
                      name="email"
                      type="email"
                      value={editUserData.email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => 
                        setEditUserData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-role">{t('users.role')}</Label>
                    <Select
                      name="role"
                      value={editUserData.role}
                      onValueChange={(value: 'user' | 'agent' | 'admin') => 
                        setEditUserData((prev) => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger id="edit-role">
                        <SelectValue placeholder={t('users.selectRole')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">{t('users.roles.user')}</SelectItem>
                        <SelectItem value="agent">{t('users.roles.agent')}</SelectItem>
                        <SelectItem value="admin">{t('users.roles.admin')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editUserData.role === 'agent' && (
                    <div>
                      <Label htmlFor="edit-agencyId">{t('users.agency')}</Label>
                      <Select
                        name="agencyId"
                        value={editUserData.agencyId}
                        onValueChange={(value: string) => 
                          setEditUserData((prev) => ({ ...prev, agencyId: value }))}
                      >
                        <SelectTrigger id="edit-agencyId">
                          <SelectValue placeholder={t('users.selectAgency')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('users.noAgency')}</SelectItem>
                          {agenciesData?.agencies.map((agency: Agency) => (
                            <SelectItem key={agency.id} value={agency.id.toString()}>
                              {agency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="status">{t('users.status')}</Label>
                    <Select
                      value={editUserData.status}
                      onValueChange={(value: 'active' | 'suspended' | 'inactive') => 
                        setEditUserData((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('users.selectStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">{t('users.statuses.active')}</SelectItem>
                        <SelectItem value="suspended">{t('users.statuses.suspended')}</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <DialogFooter className="mt-6">
                  <Button 
                    type="submit" 
                    disabled={updateUserMutation.isPending}
                    className="bg-[#131313]"
                  >
                      {updateUserMutation.isPending && <span className="mr-2 animate-spin"><Loader size={16} /></span>}
                      {t('users.actions.edit')}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('users.deleteConfirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('users.deleteConfirmDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {selectedUser && (
              <div className="bg-gray-50 p-4 rounded-md my-2">
                <p><strong>{t('users.username')}:</strong> {selectedUser.username}</p>
                <p><strong>{t('users.email')}:</strong> {selectedUser.email}</p>
                <p><strong>{t('users.role')}:</strong> {selectedUser.role}</p>
              </div>
            )}
            <AlertDialogFooter>
                <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700"
              >
                  {deleteUserMutation.isPending && <span className="mr-2 animate-spin"><Loader size={16} /></span>}
                {t('users.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={isBulkDeleteConfirmOpen} onOpenChange={setIsBulkDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('users.bulkDeleteTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('users.bulkDeleteDescription', { count: selectedUsers.length })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleBulkDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteUserMutation.isPending && <span className="mr-2 animate-spin"><Loader size={16} /></span>}
                {t('users.bulkDeleteAction', { count: selectedUsers.length })}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </>
    );
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>{t('users.title')} | {t('common:inMobi')}</title>
      </Helmet>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('users.title')}</h1>
            <p className="text-gray-500">{t('users.description')}</p>
          </div>
          <div className="flex gap-2">
            <ReportIssueButton context="users" variant="outline" />
            {activeTab === 'users' ? (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#131313]">
                    <span className="mr-2"><Plus size={16} /></span>
                    {t('users.create')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('users.create')}</DialogTitle>
                    <DialogDescription>
                      {t('users.createDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <Label htmlFor="username">{t('users.username')}</Label>
                      <Input
                        id="username"
                        value={newUserData.username}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => 
                          setNewUserData((prev) => ({ ...prev, username: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="fullName">{t('users.fullName')}</Label>
                      <Input
                        id="fullName"
                        value={newUserData.fullName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => 
                          setNewUserData((prev) => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('users.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUserData.email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => 
                          setNewUserData((prev) => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">{t('users.password')}</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUserData.password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => 
                          setNewUserData((prev) => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">{t('users.role')}</Label>
                      <Select
                        value={newUserData.role}
                        onValueChange={(value: 'user' | 'agent' | 'admin') => 
                          setNewUserData((prev) => ({ ...prev, role: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('users.selectRole')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">{t('users.roles.user')}</SelectItem>
                          <SelectItem value="agent">{t('users.roles.agent')}</SelectItem>
                          <SelectItem value="admin">{t('users.roles.admin')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newUserData.role === 'agent' && (
                      <div>
                        <Label htmlFor="agencyId">{t('users.agency')}</Label>
                        <Select
                          value={newUserData.agencyId}
                          onValueChange={(value: string) => 
                            setNewUserData((prev) => ({ ...prev, agencyId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('users.selectAgency')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t('users.noAgency')}</SelectItem>
                            {agenciesData?.agencies.map((agency: Agency) => (
                              <SelectItem key={agency.id} value={agency.id.toString()}>
                                {agency.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form>
                  <DialogFooter className="mt-6">
                    <Button type="submit" disabled={createUserMutation.isPending} className="bg-[#131313]" onClick={handleCreateUser}>
                      {createUserMutation.isPending && <span className="mr-2 animate-spin"><Loader size={16} /></span>}
                      {t('users.create')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={isCreateAgencyDialogOpen} onOpenChange={setIsCreateAgencyDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#131313]">
                    <span className="mr-2"><Home size={16} /></span>
                    {t('users.agencies.create')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>{t('users.agencies.create')}</DialogTitle>
                    <DialogDescription>
                      {t('users.agencies.createDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateAgency}>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div>
                        <Label htmlFor="name">{t('users.agencies.name')}</Label>
                        <Input
                          id="name"
                          value={newAgencyData.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setNewAgencyData((prev) => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newAgencyData.description}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                            setNewAgencyData((prev) => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={newAgencyData.address}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              setNewAgencyData((prev) => ({ ...prev, address: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={newAgencyData.city}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              setNewAgencyData((prev) => ({ ...prev, city: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={newAgencyData.state}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              setNewAgencyData((prev) => ({ ...prev, state: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={newAgencyData.zipCode}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              setNewAgencyData((prev) => ({ ...prev, zipCode: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={newAgencyData.country}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              setNewAgencyData((prev) => ({ ...prev, country: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Agency Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newAgencyData.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              setNewAgencyData((prev) => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={newAgencyData.phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              setNewAgencyData((prev) => ({ ...prev, phone: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="licenseNumber">License Number</Label>
                          <Input
                            id="licenseNumber"
                            value={newAgencyData.licenseNumber}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              setNewAgencyData((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={newAgencyData.website}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              setNewAgencyData((prev) => ({ ...prev, website: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Admin User Details</h4>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="adminFullName">Admin Full Name</Label>
                            <Input
                              id="adminFullName"
                              value={newAgencyData.adminUser.fullName}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                setNewAgencyData((prev) => ({ 
                                  ...prev, 
                                  adminUser: { ...prev.adminUser, fullName: e.target.value }
                                }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="adminEmail">Admin Email</Label>
                            <Input
                              id="adminEmail"
                              type="email"
                              value={newAgencyData.adminUser.email}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                setNewAgencyData((prev) => ({ 
                                  ...prev, 
                                  adminUser: { ...prev.adminUser, email: e.target.value }
                                }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="adminPassword">Admin Password</Label>
                            <Input
                              id="adminPassword"
                              type="password"
                              value={newAgencyData.adminUser.password}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                setNewAgencyData((prev) => ({ 
                                  ...prev, 
                                  adminUser: { ...prev.adminUser, password: e.target.value }
                                }))}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="termsAccepted"
                          checked={newAgencyData.termsAccepted}
                          onChange={(e) => 
                            setNewAgencyData((prev) => ({ ...prev, termsAccepted: e.target.checked }))}
                          required
                        />
                        <Label htmlFor="termsAccepted">I accept the terms and conditions</Label>
                      </div>
                    </div>
                    <DialogFooter className="mt-6">
                      <Button type="submit" disabled={createAgencyMutation.isPending} className="bg-[#131313]" onClick={handleCreateAgency}>
                        {createAgencyMutation.isPending && <span className="mr-2 animate-spin"><Loader size={16} /></span>}
                        {t('users.agencies.create')}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">{t('users.tabs.users')}</TabsTrigger>
            <TabsTrigger value="agencies">{t('users.tabs.agencies')}</TabsTrigger>
            <TabsTrigger value="bulk-management">Bulk Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            {renderPageContent()}
          </TabsContent>
          
          <TabsContent value="agencies">
            {renderPageContent()}
          </TabsContent>
          
          <TabsContent value="bulk-management">
            <UsersManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 