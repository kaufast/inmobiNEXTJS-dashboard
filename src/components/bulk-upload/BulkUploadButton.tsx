/**
 * Bulk Upload Button Component - Easy integration into existing dashboards
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileSpreadsheet, 
  Zap, 
  ArrowRight,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { canAccessBulkUpload, getBulkUploadPermissionMessage, type User } from '@/lib/role-permissions';
import { useToast } from '@/components/ui/use-toast';

interface BulkUploadButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => void;
  href?: string;
  showBadge?: boolean;
  showFeatures?: boolean;
  user?: User | null;
}

export function BulkUploadButton({
  variant = 'default',
  size = 'default',
  className,
  onClick,
  href = '/bulk-upload',
  showBadge = true,
  showFeatures = false,
  user
}: BulkUploadButtonProps) {
  const { toast } = useToast();
  
  const hasAccess = canAccessBulkUpload(user);
  
  const handleClick = () => {
    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: getBulkUploadPermissionMessage(user),
        variant: "destructive"
      });
      return;
    }

    if (onClick) {
      onClick();
    } else {
      // Navigate to bulk upload page
      window.location.href = href;
    }
  };

  // Don't render if user doesn't have access
  if (!hasAccess) {
    return null;
  }

  if (showFeatures) {
    return (
      <div className={cn("relative group", className)}>
        <Button
          variant={variant}
          size={size}
          onClick={handleClick}
          className="flex items-center gap-2 relative"
        >
          <Upload className="h-4 w-4" />
          Bulk Upload Properties
          {showBadge && (
            <Badge variant="secondary" className="ml-1 text-xs">
              New
            </Badge>
          )}
          <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
        
        {/* Feature tooltip */}
        <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FileSpreadsheet className="h-3 w-3 text-green-600" />
              CSV & Excel Support
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-3 w-3 text-blue-600" />
              Smart Validation
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Upload className="h-3 w-3 text-purple-600" />
              Bulk Amenities
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn("flex items-center gap-2", className)}
    >
      <Upload className="h-4 w-4" />
      Bulk Upload
      {showBadge && (
        <Badge variant="secondary" className="ml-1 text-xs">
          New
        </Badge>
      )}
    </Button>
  );
}

// Compact version for toolbars
export function BulkUploadIconButton({
  className,
  onClick,
  href = '/bulk-upload',
  user
}: Pick<BulkUploadButtonProps, 'className' | 'onClick' | 'href' | 'user'>) {
  const { toast } = useToast();
  const hasAccess = canAccessBulkUpload(user);
  
  const handleClick = () => {
    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: getBulkUploadPermissionMessage(user),
        variant: "destructive"
      });
      return;
    }

    if (onClick) {
      onClick();
    } else {
      window.location.href = href;
    }
  };

  // Don't render if user doesn't have access
  if (!hasAccess) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      className={cn("relative", className)}
      title="Bulk Upload Properties"
    >
      <Upload className="h-4 w-4" />
      <Badge 
        variant="destructive" 
        className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
      >
        !
      </Badge>
    </Button>
  );
}

// Card version for dashboard widgets
export function BulkUploadCard({
  className,
  onClick,
  href = '/bulk-upload',
  user
}: Pick<BulkUploadButtonProps, 'className' | 'onClick' | 'href' | 'user'>) {
  const { toast } = useToast();
  const hasAccess = canAccessBulkUpload(user);
  
  const handleClick = () => {
    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: getBulkUploadPermissionMessage(user),
        variant: "destructive"
      });
      return;
    }

    if (onClick) {
      onClick();
    } else {
      window.location.href = href;
    }
  };

  // Don't render if user doesn't have access
  if (!hasAccess) {
    return null;
  }

  return (
    <div 
      className={cn(
        "p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg cursor-pointer hover:shadow-md transition-all group",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Bulk Upload</h3>
            <Badge variant="secondary" className="text-xs">
              New
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Upload hundreds of properties at once with smart validation
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>• CSV/Excel Support</span>
            <span>• Auto Validation</span>
            <span>• Bulk Amenities</span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
    </div>
  );
}