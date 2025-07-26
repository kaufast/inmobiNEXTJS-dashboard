import { useTranslation } from "react-i18next";
import { Link } from "wouter";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { BulkUploadButton } from "@/components/bulk-upload/BulkUploadButton";
import { useAuth } from "@/hooks/use-auth";

import { usePropertiesData, usePropertySelection, useViewPreferences } from './properties/hooks';
import { PropertyGrid, PropertyList, BulkActionBar, ViewControls } from './properties/components';

export default function SimplePropertiesPage() {
  const { t } = useTranslation(['dashboard', 'common', 'properties']);
  const { user } = useAuth();
  
  // Custom hooks handle all complex logic
  const { 
    properties, 
    isLoading, 
    isError, 
    deleteProperty, 
    bulkDeleteProperties,
    isDeleting,
    isBulkDeleting 
  } = usePropertiesData();
  
  const { 
    isSelectionMode, 
    selectedProperties, 
    selectedCount,
    allSelected,
    toggleSelectionMode, 
    selectProperty, 
    selectAll,
    clearSelection 
  } = usePropertySelection(properties);
  
  const { viewType, setViewType } = useViewPreferences();

  // Simple event handlers
  const handleDeleteProperty = (id: number) => {
    if (window.confirm(t('agentProperties.delete.confirm'))) {
      deleteProperty(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedCount > 0) {
      const confirmMessage = t('common:bulkDeleteConfirm', { count: selectedCount });
      if (window.confirm(confirmMessage)) {
        bulkDeleteProperties(selectedProperties);
        clearSelection();
      }
    }
  };

  const isDeletingProperty = () => {
    return isDeleting; // Could be enhanced to track individual property deletion states
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {/* Skeleton Cards */}
          {viewType === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-md animate-pulse h-72">
                  <div className="rounded-lg bg-neutral-200 h-40 mb-3"></div>
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row md:h-48 w-full"
                >
                  <div className="md:w-1/4 h-48 md:h-auto bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:400%_100%] animate-shimmer"></div>
                  <div className="p-4 md:p-5 flex-1">
                    <div className="h-5 w-1/2 bg-neutral-200 animate-pulse rounded mb-3"></div>
                    <div className="h-4 w-3/4 bg-neutral-200 animate-pulse rounded mb-2"></div>
                    <div className="h-3 w-1/3 bg-neutral-200 animate-pulse rounded mb-3"></div>
                    <div className="h-8 w-24 bg-neutral-200 animate-pulse rounded mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center py-16 text-destructive">
          <p>{t('agentProperties.error')}</p>
        </div>
      );
    }

    if (!properties || properties.length === 0) {
      return (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium">{t('agentProperties.empty.title')}</h3>
          <p className="text-muted-foreground mb-4">{t('agentProperties.empty.description')}</p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild>
              <Link href="/add-property-wizard">
                <Plus className="mr-2 h-4 w-4" /> {t('agentProperties.addNew')}
              </Link>
            </Button>
            <BulkUploadButton
              user={user}
              variant="outline"
              showBadge={true}
              className="bg-white text-black border-gray-300 hover:bg-gray-50"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* View Controls */}
        <ViewControls
          viewType={viewType}
          onViewChange={setViewType}
          isSelectionMode={isSelectionMode}
          onToggleSelection={toggleSelectionMode}
          onSelectAll={selectAll}
          selectedCount={selectedCount}
          totalCount={properties.length}
          allSelected={allSelected}
        />

        {/* Property Display */}
        {viewType === 'grid' ? (
          <PropertyGrid 
            properties={properties}
            isSelectionMode={isSelectionMode}
            selectedProperties={selectedProperties}
            onSelectProperty={selectProperty}
            onDeleteProperty={handleDeleteProperty}
            isDeletingProperty={isDeletingProperty}
          />
        ) : (
          <PropertyList 
            properties={properties}
            isSelectionMode={isSelectionMode}
            selectedProperties={selectedProperties}
            onSelectProperty={selectProperty}
            onDeleteProperty={handleDeleteProperty}
            isDeletingProperty={isDeletingProperty}
          />
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="ml-[10px]">
            <h2 className="text-2xl font-bold tracking-tight">{t('agentProperties.title')}</h2>
            <p className="text-muted-foreground">
              {t('agentProperties.description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/add-property-wizard">
                <Plus className="mr-2 h-4 w-4" /> {t('agentProperties.addNew')}
              </Link>
            </Button>
            <BulkUploadButton
              user={user}
              variant="outline"
              showBadge={true}
              className="bg-white text-black border-gray-300 hover:bg-gray-50"
            />
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {isSelectionMode && selectedCount > 0 && (
          <BulkActionBar 
            selectedCount={selectedCount}
            onBulkDelete={handleBulkDelete}
            onClearSelection={clearSelection}
            isDeleting={isBulkDeleting}
          />
        )}

        <Card>
          <CardContent className="pt-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}