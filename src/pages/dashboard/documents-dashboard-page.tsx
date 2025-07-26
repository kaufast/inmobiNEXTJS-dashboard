import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { DocumentManager } from "@/components/document/DocumentManager";
import { UploadcareDocumentManager } from "@/components/document/UploadcareDocumentManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Upload, 
  Shield, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Users,
  Folder,
  Star,
  Archive,
  Settings,
  Info
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  byType: Record<string, number>;
  recentUploads: number;
  totalSize: number;
  limits?: {
    maxDocuments: number;
    maxFileSize: number;
    maxTotalStorage: number;
  };
  usage?: {
    documents: number;
    storage: number;
  };
  remaining?: {
    documents: number;
    storage: number;
  };
  percentUsed?: {
    documents: number;
    storage: number;
  };
  features?: {
    canShareDocuments: boolean;
    canBulkDelete: boolean;
  };
}

export default function DocumentsDashboardPage() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user } = useAuth();

  // Check if Uploadcare is configured
  const UPLOADCARE_PUBLIC_KEY = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY;
  const hasUploadcare = !!UPLOADCARE_PUBLIC_KEY;

  // Fetch document statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DocumentStats>({
    queryKey: ['document-stats'],
    queryFn: async () => {
      const response = await fetch('/api/documents/stats', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch document stats');
      return response.json();
    },
  });

  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
            <p className="text-muted-foreground">
              {hasUploadcare 
                ? "Securely upload, organize, and manage your documents with Uploadcare"
                : "Upload, organize, and manage your documents"
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="hidden md:flex">
              <Shield className="h-3 w-3 mr-1" />
              {hasUploadcare ? "Uploadcare Storage" : "Local Storage"}
            </Badge>
          </div>
        </div>

        {/* Uploadcare Info Alert */}
        {!hasUploadcare && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Basic document upload is available.</strong> For enhanced features like cloud storage, image processing, and CDN delivery, 
              configure Uploadcare by adding <code>VITE_UPLOADCARE_PUBLIC_KEY</code> to your environment variables.
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                      <p className="text-2xl font-bold">{stats?.total || 0}</p>
                    </div>
                    <Folder className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stats?.recentUploads || 0} uploaded this week
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                      <p className="text-2xl font-bold text-orange-600">{stats?.pending || 0}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Awaiting verification
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Verified</p>
                      <p className="text-2xl font-bold text-green-600">{stats?.verified || 0}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Shield className="h-3 w-3 mr-1" />
                    Approved documents
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                      <p className="text-2xl font-bold">
                        {stats?.totalSize ? `${(stats.totalSize / 1024 / 1024 / 1024).toFixed(1)}GB` : '0GB'}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Upload className="h-3 w-3 mr-1" />
                    {hasUploadcare ? "Uploadcare secure storage" : "Local storage"}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Subscription Limits Cards (for non-admin users) */}
        {stats?.limits && user?.role !== 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Document Usage Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Document Usage</p>
                    <p className="text-2xl font-bold">
                      {stats.usage?.documents || 0}
                      {stats.limits.maxDocuments !== -1 && (
                        <span className="text-sm text-muted-foreground">
                          /{stats.limits.maxDocuments}
                        </span>
                      )}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                {stats.limits.maxDocuments !== -1 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Used</span>
                      <span>{Math.round(stats.percentUsed?.documents || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(stats.percentUsed?.documents || 0, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.remaining?.documents || 0} documents remaining
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Storage Usage Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Storage Usage</p>
                    <p className="text-2xl font-bold">
                      {stats.usage?.storage ? `${(stats.usage.storage / 1024 / 1024).toFixed(1)}MB` : '0MB'}
                      {stats.limits.maxTotalStorage !== -1 && (
                        <span className="text-sm text-muted-foreground">
                          /{(stats.limits.maxTotalStorage / 1024 / 1024).toFixed(0)}MB
                        </span>
                      )}
                    </p>
                  </div>
                  <Archive className="h-8 w-8 text-purple-600" />
                </div>
                {stats.limits.maxTotalStorage !== -1 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Used</span>
                      <span>{Math.round(stats.percentUsed?.storage || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(stats.percentUsed?.storage || 0, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.remaining?.storage ? 
                        `${(stats.remaining.storage / 1024 / 1024).toFixed(1)}MB remaining` : 
                        '0MB remaining'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Premium Features Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Premium Features</p>
                    <p className="text-lg font-bold">
                      {stats.features?.canShareDocuments || stats.features?.canBulkDelete ? 'Available' : 'Upgrade'}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Document Sharing</span>
                    {stats.features?.canShareDocuments ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Bulk Delete</span>
                    {stats.features?.canBulkDelete ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  {!stats.features?.canShareDocuments && (
                    <Button size="sm" className="w-full mt-2" variant="outline">
                      <Star className="h-3 w-3 mr-1" />
                      Upgrade to Premium
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Document Type Distribution */}
        {stats?.byType && Object.keys(stats.byType).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Document Types
              </CardTitle>
              <CardDescription>
                Distribution of documents by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="text-center">
                    <div className="text-lg font-semibold">{count}</div>
                    <div className="text-xs text-muted-foreground capitalize">{type}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Document Management Interface */}
        <Tabs defaultValue="my-documents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
            <TabsTrigger value="my-documents">My Documents</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
            {(isAdmin || isAgent) && (
              <TabsTrigger value="all-documents">All Documents</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="my-documents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Documents</CardTitle>
                    <CardDescription>
                      Documents you've uploaded and manage
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {hasUploadcare ? (
                <UploadcareDocumentManager showAll={false} adminView={false} />
                ) : (
                  <DocumentManager showAll={false} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>
                  Recently uploaded and modified documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasUploadcare ? (
                <UploadcareDocumentManager showAll={false} adminView={false} />
                ) : (
                  <DocumentManager showAll={false} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="starred">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Starred Documents
                </CardTitle>
                <CardDescription>
                  Documents you've marked as important
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasUploadcare ? (
                <UploadcareDocumentManager showAll={false} adminView={false} />
                ) : (
                  <DocumentManager showAll={false} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {(isAdmin || isAgent) && (
            <TabsContent value="all-documents">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        All Documents
                      </CardTitle>
                      <CardDescription>
                        {isAdmin ? "All documents in the system" : "Documents from your clients"}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {isAdmin ? "Admin View" : "Agent View"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {hasUploadcare ? (
                  <UploadcareDocumentManager showAll={true} adminView={true} />
                  ) : (
                    <DocumentManager showAll={true} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Storage Features Info */}
        <Card className={hasUploadcare ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" : "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"}>
          <CardHeader>
            <CardTitle className={`flex items-center ${hasUploadcare ? "text-blue-800" : "text-gray-800"}`}>
              <Upload className="h-5 w-5 mr-2" />
              {hasUploadcare ? "Powered by Uploadcare" : "Document Storage"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <Shield className={`h-4 w-4 ${hasUploadcare ? "text-blue-600" : "text-gray-600"} mt-0.5`} />
                <div>
                  <div className={`font-medium ${hasUploadcare ? "text-blue-800" : "text-gray-800"}`}>
                    {hasUploadcare ? "Secure Storage" : "Local Storage"}
                  </div>
                  <div className={hasUploadcare ? "text-blue-600" : "text-gray-600"}>
                    {hasUploadcare ? "Enterprise-grade security and compliance" : "Documents stored locally on server"}
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <TrendingUp className={`h-4 w-4 ${hasUploadcare ? "text-blue-600" : "text-gray-600"} mt-0.5`} />
                <div>
                  <div className={`font-medium ${hasUploadcare ? "text-blue-800" : "text-gray-800"}`}>
                    {hasUploadcare ? "Global CDN" : "Direct Access"}
                  </div>
                  <div className={hasUploadcare ? "text-blue-600" : "text-gray-600"}>
                    {hasUploadcare ? "Fast delivery worldwide" : "Direct server access"}
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <FileText className={`h-4 w-4 ${hasUploadcare ? "text-blue-600" : "text-gray-600"} mt-0.5`} />
                <div>
                  <div className={`font-medium ${hasUploadcare ? "text-blue-800" : "text-gray-800"}`}>
                    {hasUploadcare ? "File Processing" : "File Support"}
                  </div>
                  <div className={hasUploadcare ? "text-blue-600" : "text-gray-600"}>
                    {hasUploadcare ? "Automatic optimization and previews" : "PDF, images, and office documents"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}