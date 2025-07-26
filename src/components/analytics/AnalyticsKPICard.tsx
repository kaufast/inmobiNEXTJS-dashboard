import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsKPICardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  icon?: React.ReactNode;
  format?: 'number' | 'currency' | 'percentage';
  loading?: boolean;
  className?: string;
}

export default function AnalyticsKPICard({
  title,
  value,
  previousValue,
  change,
  changeType = 'percentage',
  icon,
  format = 'number',
  loading = false,
  className
}: AnalyticsKPICardProps) {
  
  const formatValue = (val: string | number) => {
    const numValue = typeof val === 'string' ? parseFloat(val) : val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(numValue);
      case 'percentage':
        return `${numValue.toFixed(1)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(numValue);
    }
  };

  const getChangeIcon = () => {
    if (change === undefined || change === 0) return <Minus className="h-3 w-3" />;
    return change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const getChangeColor = () => {
    if (change === undefined || change === 0) return "text-gray-500";
    return change > 0 ? "text-green-600" : "text-red-600";
  };

  const getChangeText = () => {
    if (change === undefined) return null;
    
    const absChange = Math.abs(change);
    const formattedChange = changeType === 'percentage' 
      ? `${absChange.toFixed(1)}%`
      : formatValue(absChange);
    
    return `${formattedChange} from last period`;
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {formatValue(value)}
        </div>
        {change !== undefined && (
          <p className={cn("text-xs flex items-center gap-1", getChangeColor())}>
            {getChangeIcon()}
            {getChangeText()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}