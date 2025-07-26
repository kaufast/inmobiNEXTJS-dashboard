import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { TranslationKeysScanner } from "@/components/debug";
import AIPropertyRecommendations from "@/components/property/AIPropertyRecommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function TranslationDebugPage() {
  const { t, i18n } = useTranslation();
  const [componentSource, setComponentSource] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("ai-recommendations");

  // This is a bit of a hack to get the source code, but works for development
  useEffect(() => {
    const fetchSource = async () => {
      try {
        const response = await fetch("/src/components/property/AIPropertyRecommendations.tsx");
        const text = await response.text();
        setComponentSource(text);
      } catch (error) {
        console.error("Error fetching component source:", error);
      }
    };

    fetchSource();
  }, []);

  const copySampleToScanner = () => {
    // This would copy the source to the scanner
    // but since we're accessing across components, we'll provide 
    // instructions instead
    alert("Please copy the component source and paste it in the scanner tab manually.");
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Translation Debugging Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This page helps identify and fix missing translations in critical components.
            </p>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="ai-recommendations">
                  AI Recommendations
                </TabsTrigger>
                <TabsTrigger value="scanner">
                  Key Scanner
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai-recommendations">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">AI Recommendations Component</h3>
                  <p className="mb-4">
                    This component has been identified as potentially having missing translations.
                    View the component below to see how it renders, then use the scanner to check for missing keys.
                  </p>
                  <Button onClick={copySampleToScanner}>
                    Check Translation Keys
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Component Preview:</h3>
                  <AIPropertyRecommendations />
                </div>
              </TabsContent>

              <TabsContent value="scanner">
                <TranslationKeysScanner />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 