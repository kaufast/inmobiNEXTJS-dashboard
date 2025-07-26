import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, Language, LANGUAGES } from "@/hooks/use-language";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  Bell, 
  CreditCard, 
  Globe, 
  KeyRound, 
  Loader, 
  ShieldCheck, 
  User
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { t } = useTranslation('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state 
  const [userInfo, setUserInfo] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  
  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle profile update
  const handleUpdateProfile = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: t('profile.notifications.profileUpdated.title'),
        description: t('profile.notifications.profileUpdated.description'),
      });
    }, 1000);
  };
  
  // Handle language change
  const handleLanguageChange = (value: string) => {
    changeLanguage(value as unknown as Language);
    toast({
      title: t('profile.notifications.languageUpdated.title'),
      description: t('profile.notifications.languageUpdated.description', { language: value }),
    });
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('profile.title')}</h2>
            <p className="text-muted-foreground">
              {t('profile.subtitle')}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr]">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.fullName || t('profile.avatar.defaultUser')}</p>
                <p className="text-sm text-muted-foreground">{user?.email || t('profile.avatar.defaultEmail')}</p>
              </div>
            </div>
            
                          <div className="border rounded-md">
                <div className="bg-muted px-4 py-2 rounded-t-md">
                  <p className="text-sm font-medium">{t('profile.subscription.title')}</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium capitalize">{user?.subscriptionTier || t('profile.subscription.freePlan')} {t('profile.subscription.plan')}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.subscriptionTier === "premium" 
                          ? t('profile.subscription.fullAccess')
                          : t('profile.subscription.limitedAccess')}
                      </p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">{t('profile.subscription.upgrade')}</Button>
                    </div>
                  </div>
                </div>
              </div>
          </div>
          
          <div className="space-y-4">
            <Tabs defaultValue="account">
              <TabsList>
                <TabsTrigger value="account">{t('profile.tabs.account')}</TabsTrigger>
                <TabsTrigger value="security">{t('profile.tabs.security')}</TabsTrigger>
                <TabsTrigger value="preferences">{t('profile.tabs.preferences')}</TabsTrigger>
                <TabsTrigger value="billing">{t('profile.tabs.billing')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.account.title')}</CardTitle>
                    <CardDescription>
                      {t('profile.account.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fullName">{t('profile.account.fullName')}</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder={t('profile.account.fullNamePlaceholder')}
                        value={userInfo.fullName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">{t('profile.account.email')}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t('profile.account.emailPlaceholder')}
                        value={userInfo.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">{t('profile.account.phone')}</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder={t('profile.account.phonePlaceholder')}
                        value={userInfo.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="bg-[#131313]"
                      onClick={handleUpdateProfile}
                      disabled={isLoading}
                    >
                      {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                      {t('profile.account.saveChanges')}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.security.title')}</CardTitle>
                    <CardDescription>
                      {t('profile.security.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="current-password">{t('profile.security.currentPassword')}</Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder={t('profile.security.passwordPlaceholder')}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">{t('profile.security.newPassword')}</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder={t('profile.security.passwordPlaceholder')}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">{t('profile.security.confirmPassword')}</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder={t('profile.security.passwordPlaceholder')}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-[#131313]">{t('profile.security.updatePassword')}</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.security.twoFactor.title')}</CardTitle>
                    <CardDescription>
                      {t('profile.security.twoFactor.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <ShieldCheck className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{t('profile.security.twoFactor.disabled')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('profile.security.twoFactor.protectAccount')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="gap-1">
                      <KeyRound className="h-4 w-4" />
                      {t('profile.security.twoFactor.enable')}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.preferences.language.title')}</CardTitle>
                    <CardDescription>
                      {t('profile.preferences.language.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="language">{t('profile.preferences.language.label')}</Label>
                      <Select 
                        defaultValue={currentLanguage}
                        onValueChange={handleLanguageChange}
                      >
                        <SelectTrigger id="language" className="w-full">
                          <SelectValue placeholder={t('profile.preferences.language.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                <span>{lang.name} ({lang.nativeName})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.preferences.notifications.title')}</CardTitle>
                    <CardDescription>
                      {t('profile.preferences.notifications.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Bell className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{t('profile.preferences.notifications.settings')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('profile.preferences.notifications.comingSoon')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" disabled>
                      {t('profile.preferences.notifications.configure')}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="billing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.billing.title')}</CardTitle>
                    <CardDescription>
                      {t('profile.billing.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{t('profile.billing.paymentMethods.title')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('profile.billing.paymentMethods.none')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="gap-1">
                      <CreditCard className="h-4 w-4" />
                      {t('profile.billing.paymentMethods.add')}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.billing.subscriptionPlan.title')}</CardTitle>
                    <CardDescription>
                      {t('profile.billing.subscriptionPlan.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium capitalize">{user?.subscriptionTier || t('profile.subscription.freePlan')} {t('profile.subscription.plan')}</p>
                          <p className="text-xs text-muted-foreground">
                            {user?.subscriptionTier === "premium" 
                              ? t('profile.subscription.fullAccess')
                              : t('profile.subscription.limitedAccess')}
                          </p>
                        </div>
                        <div>
                          <Badge variant={user?.subscriptionTier === "premium" ? "default" : "outline"}>
                            {user?.subscriptionTier === "premium" ? t('profile.billing.subscriptionPlan.active') : t('profile.billing.subscriptionPlan.inactive')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">{t('profile.billing.subscriptionPlan.viewInvoices')}</Button>
                    <Button className="bg-[#131313]">{t('profile.billing.subscriptionPlan.upgradePlan')}</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}