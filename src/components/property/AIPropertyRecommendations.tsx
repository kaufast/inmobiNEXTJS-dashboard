import { useState } from "react";
import { Property } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ThumbsUp, ThumbsDown, Lightbulb, Clock } from "lucide-react";
import PropertyCard from "./PropertyCard";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function AIPropertyRecommendations() {
  const [activeTab, setActiveTab] = useState("forYou");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation("dashboard");
  
  // Fetch recommended properties
  const { data: propertiesData, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties/featured'],
    queryFn: async () => {
      try {
        const res = await fetch('http://localhost:8090/api/properties/featured');
        return await res.json();
      } catch (error) {
        console.error('Error fetching featured properties:', error);
        return [];
      }
    }
  });

  const properties = propertiesData || [];

  // Interests/lifestyle options
  const interestOptions = [
    t('aiRecommendations.interest.familyFriendly'),
    t('aiRecommendations.interest.investment'),
    t('aiRecommendations.interest.workFromHome'),
    t('aiRecommendations.interest.urbanLifestyle'),
    t('aiRecommendations.interest.natureLover'),
    t('aiRecommendations.interest.luxury'),
    t('aiRecommendations.interest.firstTimeBuyer'),
    t('aiRecommendations.interest.vacationHome')
  ];

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handlePersonalize = () => {
    if (selectedInterests.length === 0) {
      toast({
        title: t('aiRecommendations.toast.selectInterestTitle'),
        description: t('aiRecommendations.toast.selectInterestDesc'),
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: t('aiRecommendations.toast.updatedTitle'),
      description: t('aiRecommendations.toast.updatedDesc'),
    });
  };

  const handlePropertyFeedback = (liked: boolean, propertyId: number) => {
    // In a real app, this would send feedback to the AI system to improve recommendations
    toast({
      title: liked ? t('aiRecommendations.toast.addedPrefTitle') : t('aiRecommendations.toast.notedTitle'),
      description: liked 
        ? t('aiRecommendations.toast.moreLikeThis')
        : t('aiRecommendations.toast.lessLikeThis'),
    });
  };

  // Different recommendation categories
  const forYouProperties = properties.slice(0, 3);
  const similarProperties = properties.slice(3, 6);
  const trendingProperties = [...properties].sort(() => Math.random() - 0.5).slice(0, 3);

  const renderPropertyList = (propertiesToRender: Property[]) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-[350px] animate-pulse">
              <div className="bg-gray-200 h-[200px] rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (propertiesToRender.length === 0) {
      return (
        <div className="text-center p-12">
          <p className="text-muted-foreground">{t('aiRecommendations.noProperties')}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {propertiesToRender.map(property => (
          <div key={property.id} className="relative group">
            <PropertyCard 
              property={property} 
              variant="default" 
              showActions={true}
              className="h-full"
            />
            
            {/* AI Feedback buttons */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-full bg-white shadow-md h-9 px-3 border-gray-200"
                onClick={() => handlePropertyFeedback(true, property.id)}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span className="text-xs">{t('aiRecommendations.moreLikeThis')}</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-full bg-white shadow-md h-9 px-3 border-gray-200"
                onClick={() => handlePropertyFeedback(false, property.id)}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                <span className="text-xs">{t('aiRecommendations.lessLikeThis')}</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <Card className="border-none shadow-xl rounded-xl overflow-hidden mb-8">
          <CardHeader className="bg-black text-white border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-white" />
                <CardTitle className="text-xl text-white">{t('aiRecommendations.title')}</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full bg-black border-white text-white hover:bg-white hover:text-black transition-all"
                onClick={() => {}}
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                {t('aiRecommendations.howItWorks')}
              </Button>
            </div>
            <CardDescription className="mt-1 text-gray-300">
              {t('aiRecommendations.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">{t('aiRecommendations.personalizeTitle')}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {interestOptions.map(interest => (
                  <Button
                    key={interest}
                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                    size="sm"
                    className={`rounded-full transition-all ${
                      selectedInterests.includes(interest) 
                        ? "bg-black text-white" 
                        : "bg-white text-black border-gray-200"
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
              <Button 
                onClick={handlePersonalize}
                className="bg-black text-white hover:bg-white hover:text-black border border-black transition-all"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {t('aiRecommendations.updateButton')}
              </Button>
            </div>
            
            <Tabs defaultValue="forYou" value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="mb-6">
                <TabsTrigger value="forYou" className="rounded-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t('aiRecommendations.tabs.forYou')}
                </TabsTrigger>
                <TabsTrigger value="similar" className="rounded-full">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {t('aiRecommendations.tabs.similar')}
                </TabsTrigger>
                <TabsTrigger value="trending" className="rounded-full">
                  <Clock className="h-4 w-4 mr-2" />
                  {t('aiRecommendations.tabs.trending')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="forYou" className="pt-2">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">{t('aiRecommendations.personalizedForYou')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('aiRecommendations.personalizedForYouDesc')}
                  </p>
                </div>
                {renderPropertyList(forYouProperties)}
              </TabsContent>
              
              <TabsContent value="similar" className="pt-2">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">{t('aiRecommendations.similarTitle')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('aiRecommendations.similarDesc')}
                  </p>
                </div>
                {renderPropertyList(similarProperties)}
              </TabsContent>
              
              <TabsContent value="trending" className="pt-2">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">{t('aiRecommendations.trendingTitle')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('aiRecommendations.trendingDesc')}
                  </p>
                </div>
                {renderPropertyList(trendingProperties)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}