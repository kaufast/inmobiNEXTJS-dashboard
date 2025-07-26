import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Eye, MessageSquare, Calendar, Heart, TrendingUp } from "lucide-react";
import { PropertyPerformance } from "@/hooks/use-analytics";

interface PropertyPerformanceTableProps {
  properties: PropertyPerformance[];
  loading?: boolean;
  className?: string;
}

export default function PropertyPerformanceTable({
  properties,
  loading = false,
  className
}: PropertyPerformanceTableProps) {
  
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Top Performing Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (properties.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Top Performing Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No property performance data available for the selected period.</p>
            <p className="text-sm mt-2">Property views and interactions will appear here once you have active listings.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxViews = Math.max(...properties.map(p => p.views));

  const getPerformanceBadge = (conversionRate: number) => {
    if (conversionRate >= 15) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
    } else if (conversionRate >= 10) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Good</Badge>;
    } else if (conversionRate >= 5) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Average</Badge>;
    } else {
      return <Badge variant="default" className="bg-red-100 text-red-800">Needs Attention</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Performing Properties
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead className="text-center">Views</TableHead>
                <TableHead className="text-center">Inquiries</TableHead>
                <TableHead className="text-center">Tours</TableHead>
                <TableHead className="text-center">Favorites</TableHead>
                <TableHead className="text-center">Conversion</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property, index) => (
                <TableRow key={property.propertyId} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="font-medium truncate max-w-48" title={property.title}>
                          {property.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {property.propertyId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-blue-500" />
                        <span className="font-medium">{property.views.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(property.views / maxViews) * 100} 
                        className="w-12 h-1" 
                      />
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <MessageSquare className="h-3 w-3 text-green-500" />
                      <span className="font-medium">{property.inquiries}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3 text-purple-500" />
                      <span className="font-medium">{property.tours}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Heart className="h-3 w-3 text-red-500" />
                      <span className="font-medium">{property.favorites}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="font-medium">
                      {property.conversionRate.toFixed(1)}%
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getPerformanceBadge(property.conversionRate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {properties.length > 0 && (
          <div className="mt-4 text-xs text-muted-foreground border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3 text-blue-500" />
                <span>Total Views: {properties.reduce((sum, p) => sum + p.views, 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3 w-3 text-green-500" />
                <span>Total Inquiries: {properties.reduce((sum, p) => sum + p.inquiries, 0)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-purple-500" />
                <span>Total Tours: {properties.reduce((sum, p) => sum + p.tours, 0)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-3 w-3 text-red-500" />
                <span>Total Favorites: {properties.reduce((sum, p) => sum + p.favorites, 0)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}