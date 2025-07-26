import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Filter } from "lucide-react";
import { format, subDays } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export interface AnalyticsFilters {
  period?: 'today' | '7days' | '30days' | '90days' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  scope?: 'agent' | 'agency';
  granularity?: 'day' | 'week' | 'month';
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  onExport?: () => void;
  className?: string;
}

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: '90days', label: 'Last 90 days' },
  { value: 'year', label: 'Last year' },
  { value: 'custom', label: 'Custom range' },
];

const GRANULARITY_OPTIONS = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];

export default function AnalyticsFilters({
  filters,
  onFiltersChange,
  onExport,
  className
}: AnalyticsFiltersProps) {
  const { user } = useAuth();
  const [showCustomDates, setShowCustomDates] = useState(filters.period === 'custom');
  
  const canViewAgencyData = user?.role === 'admin' || user?.role === 'agency_admin';

  const handlePeriodChange = (period: string) => {
    const newFilters = { ...filters, period: period as AnalyticsFilters['period'] };
    
    if (period === 'custom') {
      setShowCustomDates(true);
      // Set default custom dates if not already set
      if (!filters.startDate || !filters.endDate) {
        const endDate = new Date();
        const startDate = subDays(endDate, 30);
        newFilters.startDate = format(startDate, 'yyyy-MM-dd');
        newFilters.endDate = format(endDate, 'yyyy-MM-dd');
      }
    } else {
      setShowCustomDates(false);
      // Clear custom dates when using predefined periods
      delete newFilters.startDate;
      delete newFilters.endDate;
    }
    
    onFiltersChange(newFilters);
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const handleScopeChange = (scope: string) => {
    onFiltersChange({
      ...filters,
      scope: scope as AnalyticsFilters['scope'],
    });
  };

  const handleGranularityChange = (granularity: string) => {
    onFiltersChange({
      ...filters,
      granularity: granularity as AnalyticsFilters['granularity'],
    });
  };

  const resetFilters = () => {
    setShowCustomDates(false);
    onFiltersChange({
      period: '30days',
      scope: 'agent',
      granularity: 'day',
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters & Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Period */}
        <div className="space-y-2">
          <Label htmlFor="period">Time Period</Label>
          <Select value={filters.period || '30days'} onValueChange={handlePeriodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range */}
        {showCustomDates && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Scope (only show if user can access agency data) */}
        {canViewAgencyData && (
          <div className="space-y-2">
            <Label htmlFor="scope">Data Scope</Label>
            <Select value={filters.scope || 'agent'} onValueChange={handleScopeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">My Data</SelectItem>
                <SelectItem value="agency">Agency Wide</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Granularity */}
        <div className="space-y-2">
          <Label htmlFor="granularity">Chart Granularity</Label>
          <Select value={filters.granularity || 'day'} onValueChange={handleGranularityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select granularity" />
            </SelectTrigger>
            <SelectContent>
              {GRANULARITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}