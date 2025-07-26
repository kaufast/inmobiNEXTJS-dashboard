import BaseLayout from "@/components/layout/BaseLayout";
import PropertyCard from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { apiRequest } from "@/lib/queryClient";
import { Property } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Heart, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

export default function FavoritesPage() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { favorites } = useFavorites();
  
  const { data: favoriteProperties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiRequest("GET", `/api/favorites/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch favorites');
      return res.json();
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <BaseLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 flex items-center">
            <Heart className="mr-2 h-6 w-6" />
            {t('navbar.favorites')}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </BaseLayout>
    );
  }

  // Error/Empty state
  if (!favoriteProperties || favoriteProperties.length === 0) {
    return (
      <BaseLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 flex items-center">
            <Heart className="mr-2 h-6 w-6" />
            {t('navbar.favorites')}
          </h1>
          
          <div className="w-full flex items-center justify-center py-8">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="pt-6">
                <div className="flex mb-4 gap-2 items-center">
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t('favorites.noFavoritesTitle', { defaultValue: 'No Favorites Yet' })}
                  </h1>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  {t('favorites.noFavoritesMessage', { defaultValue: "You haven't added any properties to your favorites." })}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {t('favorites.noFavoritesHint', { defaultValue: 'Click the heart icon on any property to save it here.' })}
                </p>
                <div className="mt-6 flex justify-center">
                  <Button asChild className="bg-black text-white hover:bg-gray-800">
                    <Link href="/search">
                      <Home className="mr-2 h-4 w-4" />
                      {t('favorites.browseProperties', { defaultValue: 'Browse Properties' })}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </BaseLayout>
    );
  }

  // Display favorites
  return (
    <BaseLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Heart className="mr-2 h-6 w-6" />
          {t('navbar.favorites')}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </BaseLayout>
  );
}