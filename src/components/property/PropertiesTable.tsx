import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Property } from "@shared/schema";
import { Building, Edit, Eye, Loader2, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

// Helper functions to determine property type
const isMockProperty = (property: Property): boolean => {
  if (!property || !property.title || !property.description) {
    return false;
  }

  const mockTitlePattern = /(Luxurious|Spacious) \d+ Bedroom (apartment|villa|penthouse|townhouse|office|retail|land) in/i;
  const mockDescriptionPattern = /Beautiful (apartment|villa|penthouse|townhouse|office|retail|land) located in the heart of.*stunning property features \d+ bedrooms/i;
  
  if (mockTitlePattern.test(property.title) && mockDescriptionPattern.test(property.description)) {
    return true;
  }
  
  const isRecentlyCreated = property.createdAt && 
    new Date(property.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000;
  
  const hasMockImages = property.images && Array.isArray(property.images) && 
    property.images.some(img => {
      if (!img) return false;
      if (typeof img === 'string') {
        return img.includes('unsplash.com');
      } else if (typeof img === 'object' && img && 'url' in img) {
        const url = img.url;
        return typeof url === 'string' && url.includes('unsplash.com');
      }
      return false;
    });
  
  return isRecentlyCreated && !!hasMockImages;
};

const isRealProperty = (property: Property): boolean => {
  if (!property) {
    return false;
  }
  
  if (isMockProperty(property)) {
    return false;
  }
  
  const hasVariedTextLength = 
    property.title &&
    property.description &&
    property.title.length > 10 && 
    property.title.length < 100 &&
    property.description.length > 50 &&
    property.description.length < 1000;
  
  const isVerified = property.isVerified === true;
  
  const hasCustomFeatures = 
    property.features && 
    Array.isArray(property.features) && 
    property.features.length > 0 && 
    property.features.some(f => {
      return f && typeof f === 'string' && f.length > 3;
    });
  
  return !!hasVariedTextLength || isVerified || !!hasCustomFeatures;
};

interface PropertiesTableProps {
  properties: Property[];
  isLoading: boolean;
  selectMode: boolean;
  selectedProperties: number[];
  onSelectionChange: (id: number) => void;
  onSelectAll: () => void;
  onDeleteClick: (id: number) => void;
}

export function PropertiesTable({
  properties,
  isLoading,
  selectMode,
  selectedProperties,
  onSelectionChange,
  onSelectAll,
  onDeleteClick,
}: PropertiesTableProps) {
  const { t } = useTranslation(['dashboard', 'common']);

  const allSelected = properties && properties.length > 0 && selectedProperties.length === properties.length;

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-xl">{t("agentProperties.propertyListings")}</CardTitle>
        <CardDescription>
          {isLoading
            ? t("general.loading")
            : t("agentProperties.propertiesFound", { count: properties?.length || 0 })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {selectMode && (
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={onSelectAll}
                        aria-label={t("agentProperties.selectAll")}
                      />
                    </TableHead>
                  )}
                  <TableHead>{t("agentProperties.table.property")}</TableHead>
                  <TableHead>{t("agentProperties.table.status")}</TableHead>
                  <TableHead>{t("agentProperties.table.price")}</TableHead>
                  <TableHead className="text-right">{t("agentProperties.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties && properties.length > 0 ? (
                  properties.map((property) => (
                    <TableRow key={property.id} className={selectedProperties.includes(property.id) ? "bg-muted/50" : ""}>
                      {selectMode && (
                        <TableCell>
                          <Checkbox
                            checked={selectedProperties.includes(property.id)}
                            onCheckedChange={() => onSelectionChange(property.id)}
                            aria-label={`Select property ${property.title}`}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{property.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={property.isVerified ? "default" : "outline"}>
                          {property.isVerified ? t("agentProperties.status.verified") : t("agentProperties.status.pending")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ${property.price.toLocaleString()}
                        {property.listingType === "rent" && t("agentProperties.pricePerMonth")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" asChild size="icon">
                            <Link href={`/property/${property.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" asChild size="icon">
                            <Link href={`/dashboard/properties/edit/${property.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600 hover:bg-red-50" 
                            onClick={() => onDeleteClick(property.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={selectMode ? 5 : 4} className="text-center py-8 text-muted-foreground">
                      {t("agentProperties.noProperties")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 