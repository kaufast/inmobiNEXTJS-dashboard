import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerificationForm } from '@/components/verification/VerificationForm';
import { VerificationStatus } from '@/components/verification/VerificationStatus';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, ArrowRight, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';

export default function VerificationPage() {
  const { t, i18n } = useTranslation('auth');
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('status');
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const currentLang = i18n.language;

  if (!user) {
    setLocation('/auth');
    return null;
  }

  const handleStartVerification = () => {
    setActiveTab('start');
  };

  const handleVerificationSuccess = () => {
    toast({
      title: t('verification.submitted'),
      description: t('verification.submitted_description'),
    });
    setActiveTab('status');
  };

  return (
    <DashboardLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('verification.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('verification.description')}</p>
          </div>
          <Button 
            onClick={handleStartVerification}
            className="bg-black text-white hover:bg-white hover:text-black hover:border-black border transition-colors"
          >
            {t('verification.start')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="status"
              className="data-[state=active]:bg-black data-[state=active]:text-white"
            >
              {t('verification.status')}
            </TabsTrigger>
            <TabsTrigger 
              value="start"
              className="data-[state=active]:bg-black data-[state=active]:text-white"
            >
              {t('verification.start')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="mt-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>{t('verification.status_title')}</CardTitle>
                <CardDescription>{t('verification.status_description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <VerificationStatus
                  userId={user.id}
                  onStartVerification={handleStartVerification}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="start" className="mt-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>{t('verification.start_title')}</CardTitle>
                <CardDescription>{t('verification.start_description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <VerificationForm onSuccess={handleVerificationSuccess} />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('status')}
                >
                  {t('verification.back_to_status')}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 space-y-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-black" />
            <h2 className="text-xl font-semibold">{t('verification.benefits')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('verification.why_verify')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 list-none">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <span>{t('verification.benefit_trust')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <span>{t('verification.benefit_priority')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <span>{t('verification.benefit_credibility')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <span>{t('verification.benefit_premium')}</span>
                  </li>
                </ul>
                
                <div className="mt-6">
                  <Button 
                    onClick={handleStartVerification}
                    className="w-full bg-black text-white hover:bg-white hover:text-black hover:border-black border transition-colors"
                  >
                    {t('verification.get_verified_now')}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('verification.types')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold">{t('verification.user_type')}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 ml-10">{t('verification.user_type_description')}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold">{t('verification.agency_type')}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 ml-10">{t('verification.agency_type_description')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-black" />
                <CardTitle className="text-lg">{t('verification.help')}</CardTitle>
              </div>
              <CardDescription>{t('verification.help_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="bg-black text-white hover:bg-white hover:text-black hover:border-black border transition-colors"
                >
                  <Link href={`/${i18n.language}/dashboard/verification-guide`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t('verification.view_guide')}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="mailto:verification@inmobi.mobi">
                    {t('verification.contact_support')}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}