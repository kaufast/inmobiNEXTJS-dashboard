import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Building, 
  ExternalLink, 
  BarChart4, 
  Cog, 
  Check, 
  X, 
  Loader2,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/lib/user-service";
import { useToast } from "@/hooks/use-toast";
import PropertyCard from "@/components/property/PropertyCard";
import type { Property } from "@shared/types";
import { format } from "date-fns";
import i18n from "i18next";

// Admin User interface for this component
interface AdminUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
  status?: 'active' | 'suspended' | 'inactive';
  createdAt: string;
  agencyId?: number | null;
  agencyName?: string;
  isVerified: boolean;
}

interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
}

interface ApprovalItem {
  id: number;
  type: string;
  name: string;
  user: string;
  date: string;
}

interface AnalyticsData {
  userCount: {
    day: number;
    week: number;
    month: number;
  };
  propertyCount: {
    day: number;
    week: number;
    month: number;
  };
  pageViews: {
    day: number;
    week: number;
    month: number;
  };
  revenue: {
    day: number;
    week: number;
    month: number;
  };
}

export default function AdminDashboard() {
  const { t } = useTranslation('dashboard');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("week");
  const [editUserDialogOpen, setEditUserDialogOpen] = useState<AdminUser | null>(null);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'agent' | 'admin'
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Fetch real users data
  const { data: usersData, isLoading: isLoadingUsers } = useQuery<AdminUsersResponse>({
    queryKey: ["adminUsers", { limit: 10 }],
    queryFn: async () => {
      const result = await UserService.getUsers({ limit: 10 });
      // Transform the data to match our AdminUser interface
      return {
        users: result.users.map(user => ({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role === 'agency_admin' ? 'admin' : user.role === 'agency_agent' ? 'agent' : user.role as 'user' | 'agent' | 'admin',
          status: (user as any).status || 'active',
          createdAt: user.createdAt.toString(),
          agencyId: user.agencyId,
          agencyName: (user as any).agencyName || undefined,
          isVerified: user.isVerified || false
        })),
        total: result.total
      };
    }
  });
  
  // Fetch properties data
  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties", { limit: 6 }],
  });
  
  // Mock pending approvals data (this could be made real too)
  const pendingApprovals: ApprovalItem[] = [
    { id: 1, type: "property", name: "Luxury Beachfront Villa", user: "Emma Wilson", date: "2025-04-20T09:45:00Z" },
    { id: 2, type: "agent", name: "John Simmons", user: "John Simmons", date: "2025-04-19T14:30:00Z" },
    { id: 3, type: "property", name: "Modern Urban Apartment", user: "Sarah Kim", date: "2025-04-18T11:20:00Z" },
  ];

  // Analytics data based on real user count
  const analyticsData: AnalyticsData = {
    userCount: {
      day: Math.floor((usersData?.total || 0) * 0.1),
      week: Math.floor((usersData?.total || 0) * 0.3),
      month: usersData?.total || 0
    },
    propertyCount: {
      day: Math.floor((properties?.length || 0) * 0.2),
      week: Math.floor((properties?.length || 0) * 0.6),
      month: properties?.length || 0
    },
    pageViews: {
      day: 1250,
      week: 8450,
      month: 32600
    },
    revenue: {
      day: 2800,
      week: 18500,
      month: 72000
    }
  };

  // User management mutations
  const updateUserMutation = useMutation({
    mutationFn: (userData: { id: number; updates: Partial<AdminUser> }) => 
      UserService.updateUser(userData.id, userData.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "User Updated",
        description: "User has been successfully updated."
      });
      setEditUserDialogOpen(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive"
      });
    }
  });

  const suspendUserMutation = useMutation({
    mutationFn: (userId: number) => UserService.suspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "User Suspended",
        description: "User has been suspended successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Suspension Failed",
        description: error.response?.data?.message || "Failed to suspend user",
        variant: "destructive"
      });
    }
  });

  const reactivateUserMutation = useMutation({
    mutationFn: (userId: number) => UserService.reactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "User Reactivated",
        description: "User has been reactivated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reactivation Failed",
        description: error.response?.data?.message || "Failed to reactivate user",
        variant: "destructive"
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => UserService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: any) => UserService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "User Created",
        description: "User has been created successfully."
      });
      setCreateUserDialogOpen(false);
      setNewUser({
        username: '',
        fullName: '',
        email: '',
        password: '',
        role: 'user'
      });
      setValidationErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive"
      });
    }
  });

  const handleUserAction = (user: AdminUser, action: 'edit' | 'suspend' | 'reactivate' | 'delete') => {
    switch (action) {
      case 'edit':
        setEditUserDialogOpen(user);
        break;
      case 'suspend':
        suspendUserMutation.mutate(user.id);
        break;
      case 'reactivate':
        reactivateUserMutation.mutate(user.id);
        break;
      case 'delete':
        if (confirm(t('admin.confirmDeleteUser', { name: user.fullName }))) {
          deleteUserMutation.mutate(user.id);
        }
        break;
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newUser.username.trim()) {
      errors.username = t('form.validation.usernameRequired');
    } else if (newUser.username.length < 3) {
      errors.username = t('form.validation.usernameMinLength');
    }
    
    if (!newUser.fullName.trim()) {
      errors.fullName = t('form.validation.fullNameRequired');
    }
    
    if (!newUser.email.trim()) {
      errors.email = t('form.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = t('form.validation.emailInvalid');
    }
    
    if (!newUser.password.trim()) {
      errors.password = t('form.validation.passwordRequired');
    } else if (newUser.password.length < 6) {
      errors.password = t('form.validation.passwordMinLength');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if form is valid
  const isFormValid = () => {
    return newUser.username.trim().length >= 3 &&
           newUser.fullName.trim().length > 0 &&
           newUser.email.trim().length > 0 &&
           /\S+@\S+\.\S+/.test(newUser.email) &&
           newUser.password.trim().length >= 6;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('admin.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Cog className="mr-2 h-4 w-4" />
            {t('admin.systemSettings')}
          </Button>
          <Button className="bg-[#131313]">
            {t('admin.generateReports')}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.stats.totalUsers')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.userCount[timeframe]}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "day" ? 5 : timeframe === "week" ? 12 : 18}%</span>
              <span className="text-xs text-muted-foreground ml-1">{t('general.timeframes.fromPrevious', { timeframe: t(`general.timeframes.${timeframe}`) })}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.stats.properties')}
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.propertyCount[timeframe]}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "day" ? 2 : timeframe === "week" ? 8 : 15}%</span>
              <span className="text-xs text-muted-foreground ml-1">{t('general.timeframes.fromPrevious', { timeframe: t(`general.timeframes.${timeframe}`) })}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.stats.pageViews')}
            </CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.pageViews[timeframe].toLocaleString()}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "day" ? 12 : timeframe === "week" ? 22 : 18}%</span>
              <span className="text-xs text-muted-foreground ml-1">{t('general.timeframes.fromPrevious', { timeframe: t(`general.timeframes.${timeframe}`) })}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.stats.revenue')}
            </CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat(i18n.language, { 
                style: 'currency', 
                currency: 'GBP'  
              }).format(analyticsData.revenue[timeframe])}
            </div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "day" ? 7 : timeframe === "week" ? 15 : 28}%</span>
              <span className="text-xs text-muted-foreground ml-1">{t('general.timeframes.fromPrevious', { timeframe: t(`general.timeframes.${timeframe}`) })}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <div className="inline-flex rounded-md bg-neutral-100">
          <Button
            variant={timeframe === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("day")}
            className={timeframe === "day" ? "bg-[#131313]" : ""}
          >
            {t('general.timeframes.day')}
          </Button>
          <Button
            variant={timeframe === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("week")}
            className={timeframe === "week" ? "bg-[#131313]" : ""}
          >
            {t('general.timeframes.week')}
          </Button>
          <Button
            variant={timeframe === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("month")}
            className={timeframe === "month" ? "bg-[#131313]" : ""}
          >
            {t('general.timeframes.month')}
          </Button>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">{t('admin.pendingApprovals')}</TabsTrigger>
          <TabsTrigger value="users">{t('admin.usersManagement')}</TabsTrigger>
          <TabsTrigger value="properties">{t('admin.properties')}</TabsTrigger>
        </TabsList>
        
        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.itemsPendingApproval')}</CardTitle>
              <CardDescription>
                {t('admin.reviewManageSubmissions')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('general.type')}</TableHead>
                        <TableHead>{t('general.name')}</TableHead>
                        <TableHead>{t('admin.submittedBy')}</TableHead>
                        <TableHead>{t('general.date')}</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApprovals.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.user}</TableCell>
                          <TableCell>{format(new Date(item.date), 'PPP')}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                                <Check className="h-4 w-4 mr-1" />
                                {t('general.approve')}
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-500 border-red-500 hover:bg-red-50">
                                <X className="h-4 w-4 mr-1" />
                                {t('general.reject')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Check className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                  <h3 className="text-lg font-medium mb-2">{t('admin.noApprovals')}</h3>
                  <p>{t('admin.allCaughtUp')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users Tab - Now with real data */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('admin.userManagement')}</CardTitle>
                <CardDescription>
                  {t('admin.viewManageAccounts')}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setCreateUserDialogOpen(true)}
                  className="bg-[#131313]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.addUser')}
                </Button>
                <Button 
                  onClick={() => window.open('/dashboard/users', '_blank')}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.fullUserManagement')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#131313]" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('general.user')}</TableHead>
                        <TableHead>{t('general.role')}</TableHead>
                        <TableHead>{t('general.status')}</TableHead>
                        <TableHead>{t('general.joined')}</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData?.users?.slice(0, 5).map((user) => (
                        <TableRow key={user.id} className={user.status === 'inactive' ? 'bg-yellow-50' : ''}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 font-medium">
                                {user.fullName?.charAt(0) || user.username.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{user.fullName || user.username}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.role === "admin" ? "default" : "outline"} 
                              className={`capitalize ${user.role === "admin" ? "bg-blue-500 text-white" : ""}`}
                            >
                              {user.role}
                            </Badge>
                            {user.isVerified && (
                              <Badge variant="outline" className="ml-2 text-green-600 bg-green-50">
                                {t('global.verified')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.status === "active" ? "outline" : "destructive"} 
                              className={`capitalize ${
                                user.status === "active" 
                                  ? "text-emerald-600 bg-emerald-50" 
                                  : user.status === "suspended" 
                                    ? "text-red-600 bg-red-50" 
                                    : "text-amber-600 bg-amber-50"
                              }`}
                            >
                              {user.status || 'active'}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(user.createdAt), 'PP')}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handleUserAction(user, 'edit')}
                                title={t('general.edit')}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user.status === 'active' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-amber-500"
                                  onClick={() => handleUserAction(user, 'suspend')}
                                  title={t('admin.suspendUser')}
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-green-500"
                                  onClick={() => handleUserAction(user, 'reactivate')}
                                  title={t('admin.reactivateUser')}
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => handleUserAction(user, 'delete')}
                                title={t('general.delete')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) || []}
                    </TableBody>
                  </Table>
                </div>
              )}
              {usersData?.total && usersData.total > 5 && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('/dashboard/users', '_blank')}
                  >
                    {t('admin.viewAllUsers', { count: usersData.total })}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('admin.recentProperties')}</CardTitle>
                <CardDescription>
                  {t('admin.recentPropertiesDescription')}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.open('/add-property', '_blank')}
                  className="bg-[#131313]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.addProperty')}
                </Button>
                <Button variant="outline">{t('general.viewAll')}</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingProperties ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#131313]" />
                </div>
              ) : properties && properties.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('admin.tableHeaders.property')}</TableHead>
                        <TableHead>{t('admin.tableHeaders.location')}</TableHead>
                        <TableHead>{t('admin.tableHeaders.price')}</TableHead>
                        <TableHead>{t('admin.tableHeaders.type')}</TableHead>
                        <TableHead>{t('admin.tableHeaders.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.slice(0, 6).map((property) => (
                        <TableRow key={property.id.toString()}>
                          <TableCell>
                            <div className="font-medium">{property.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {property.bedrooms} bed, {property.bathrooms} bath
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{property.city}, {property.country}</div>
                            <div className="text-sm text-muted-foreground">{property.address}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {new Intl.NumberFormat('en-GB', {
                                style: 'currency',
                                currency: (property as any).currency || 'GBP'
                              }).format(property.price)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {property.propertyType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={(property as any).isVerified ? "outline" : "destructive"}
                              className={(property as any).isVerified ? "text-green-600 bg-green-50" : ""}
                            >
                              {(property as any).isVerified ? t('global.verified') : t('global.pending')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">{t('admin.noPropertiesFound')}</h3>
                  <p className="text-muted-foreground">
                    {t('admin.noPropertiesInSystem')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={!!editUserDialogOpen} onOpenChange={() => setEditUserDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.editUser')}</DialogTitle>
            <DialogDescription>
              {t('admin.updateUserDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">{t('general.fullName')}</label>
              <Input
                value={editUserDialogOpen?.fullName || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditUserDialogOpen(editUserDialogOpen ? { ...editUserDialogOpen, fullName: e.target.value } : null)
                }
              />
            </div>
            <div>
              <label className="block mb-1">{t('general.role')}</label>
              <Select
                value={editUserDialogOpen?.role || ""}
                onValueChange={(role: 'user' | 'agent' | 'admin') =>
                  setEditUserDialogOpen(editUserDialogOpen ? { ...editUserDialogOpen, role } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('general.role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{t('users.roles.user')}</SelectItem>
                  <SelectItem value="agent">{t('users.roles.agent')}</SelectItem>
                  <SelectItem value="admin">{t('users.roles.admin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (editUserDialogOpen) {
                  updateUserMutation.mutate({
                    id: editUserDialogOpen.id,
                    updates: {
                      fullName: editUserDialogOpen.fullName,
                      role: editUserDialogOpen.role
                    }
                  });
                }
              }}
              disabled={updateUserMutation.isPending}
              className="bg-[#131313]"
            >
              {updateUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t('general.save')}
            </Button>
            <Button variant="outline" onClick={() => setEditUserDialogOpen(null)}>
              {t('general.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createUserDialogOpen} onOpenChange={(open: boolean) => {
        setCreateUserDialogOpen(open);
        if (!open) {
          setValidationErrors({});
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.createNewUser')}</DialogTitle>
            <DialogDescription>
              {t('admin.createUserDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label>{t('form.labels.username')}</label>
              <Input
                value={newUser.username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNewUser({ ...newUser, username: e.target.value });
                  if (validationErrors.username) {
                    setValidationErrors({ ...validationErrors, username: '' });
                  }
                }}
                placeholder={t('form.placeholders.enterUsername')}
                className={validationErrors.username ? "border-red-500" : ""}
              />
              {validationErrors.username && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
              )}
            </div>
            <div>
              <label>{t('form.labels.fullName')}</label>
              <Input
                value={newUser.fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNewUser({ ...newUser, fullName: e.target.value });
                  if (validationErrors.fullName) {
                    setValidationErrors({ ...validationErrors, fullName: '' });
                  }
                }}
                placeholder={t('form.placeholders.enterFullName')}
                className={validationErrors.fullName ? "border-red-500" : ""}
              />
              {validationErrors.fullName && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.fullName}</p>
              )}
            </div>
            <div>
              <label>{t('form.labels.email')}</label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNewUser({ ...newUser, email: e.target.value });
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: '' });
                  }
                }}
                placeholder={t('form.placeholders.enterEmail')}
                className={validationErrors.email ? "border-red-500" : ""}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>
            <div>
              <label>{t('form.labels.password')}</label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNewUser({ ...newUser, password: e.target.value });
                  if (validationErrors.password) {
                    setValidationErrors({ ...validationErrors, password: '' });
                  }
                }}
                placeholder={t('form.placeholders.enterPassword')}
                className={validationErrors.password ? "border-red-500" : ""}
              />
              {validationErrors.password && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
              )}
            </div>
            <div>
              <label>{t('form.labels.role')}</label>
              <Select
                value={newUser.role}
                onValueChange={(role: 'user' | 'agent' | 'admin') =>
                  setNewUser({ ...newUser, role })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('form.placeholders.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{t('admin.roles.user')}</SelectItem>
                  <SelectItem value="agent">{t('admin.roles.agent')}</SelectItem>
                  <SelectItem value="admin">{t('admin.roles.admin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (validateForm()) {
                  createUserMutation.mutate(newUser);
                }
              }}
              disabled={createUserMutation.isPending || !isFormValid()}
              className="bg-[#131313]"
            >
              {createUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t('admin.createUser')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setCreateUserDialogOpen(false)}
              disabled={createUserMutation.isPending}
            >
              {t('general.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}