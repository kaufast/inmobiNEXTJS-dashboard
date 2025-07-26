import { useAuth } from "@/hooks/use-auth";
import { DocumentManager } from "@/components/document/DocumentManager";
import { UploadcareDocumentManager } from "@/components/document/UploadcareDocumentManager";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { FileText, ArrowLeft, Upload, Settings } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DocumentsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Check if Uploadcare is configured
  const UPLOADCARE_PUBLIC_KEY = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY;
  const hasUploadcare = !!UPLOADCARE_PUBLIC_KEY;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/dashboard">
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Document Management</h1>
              <p className="text-muted-foreground mt-1">
                {hasUploadcare 
                  ? "Upload and manage your documents with Uploadcare" 
                  : "Upload and manage your documents"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasUploadcare && (
              <Link href="/dashboard/documents/enhanced">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Enhanced View
                </Button>
              </Link>
            )}
          </div>
        </div>

        {!hasUploadcare && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Settings className="h-4 w-4" />
            <AlertTitle>Enhanced Features Available</AlertTitle>
            <AlertDescription>
              Configure Uploadcare to enable advanced document management features including 
              multi-source uploads, real-time preview, and global CDN delivery.{" "}
              <Link href="/dashboard/documents/enhanced" className="text-blue-600 hover:underline">
                View setup instructions
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue={hasUploadcare ? "uploadcare" : "standard"} className="space-y-4">
          <TabsList>
            <TabsTrigger value="standard">Standard Upload</TabsTrigger>
            {hasUploadcare && (
              <TabsTrigger value="uploadcare">Uploadcare Enhanced</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="standard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-primary" />
                  Documents - Standard Upload
                </CardTitle>
                <CardDescription>
                  Basic document management with file upload functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentManager showAll={true} />
              </CardContent>
            </Card>
          </TabsContent>

          {hasUploadcare && (
            <TabsContent value="uploadcare">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-6 w-6 mr-2 text-primary" />
                    Documents - Uploadcare Enhanced
                  </CardTitle>
                  <CardDescription>
                    Enhanced document management with Uploadcare integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UploadcareDocumentManager showAll={true} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}