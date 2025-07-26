import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, KeyRound } from "lucide-react";

export default function SecurityPage() {
  const { user } = useAuth();
  const { t } = useTranslation('dashboard');

  return (
    <DashboardLayout>
      <Helmet>
        <title>{t('dashboard.nav.security')} | Inmobi</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.nav.security')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('securityPage.subtitle', 'Manage security settings and access controls')}
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('securityPage.adminPassword', 'Admin Password')}</CardTitle>
              <CardDescription>
                {t('securityPage.updatePassword', 'Update the administrator password')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">{t('securityPage.currentPassword', 'Current Password')}</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••••"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">{t('securityPage.newPassword', 'New Password')}</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••••"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">{t('securityPage.confirmPassword', 'Confirm Password')}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••••"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-[#131313]">{t('securityPage.updatePassword', 'Update Password')}</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('securityPage.twoFactor', 'Two-Factor Authentication')}</CardTitle>
              <CardDescription>
                {t('securityPage.twoFactorDesc', 'Add an extra layer of security to your account')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <ShieldCheck className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('securityPage.twoFactorDisabled', 'Two-factor authentication is disabled')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('securityPage.twoFactorProtect', 'Protect your account with an additional authentication step')}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="gap-1">
                <KeyRound className="h-4 w-4" />
                {t('securityPage.enable2FA', 'Enable 2FA')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 