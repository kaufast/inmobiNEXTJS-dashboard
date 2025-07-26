import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/hooks/use-settings";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LANGUAGES } from "@/hooks/use-language";
import React from "react";

export default function SettingsPage() {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const {
    systemSettings,
    systemLoading,
    personalSettings,
    personalLoading,
    updateGeneralSettings,
    updateSecuritySettings,
    updateNotificationSettings,
    updateIntegrationSettings,
    updatePersonalSettings,
    isConnected
  } = useSettings();

  // Form state
  const [generalForm, setGeneralForm] = useState({
    siteName: '',
    defaultLanguage: '',
    maintenanceMode: false
  });
  const [securityForm, setSecurityForm] = useState({
    requireTwoFactor: false,
    requireEmailVerification: false,
    sessionTimeout: 30
  });
  const [notificationForm, setNotificationForm] = useState({
    emailNotifications: false,
    pushNotifications: false,
    notificationEmail: ''
  });
  const [integrationForm, setIntegrationForm] = useState({
    googleMapsApiKey: '',
    stripeApiKey: '',
    smtpServer: ''
  });
  const [personalForm, setPersonalForm] = useState({
    messageNotifications: true,
    propertyInquiries: true,
    systemNotifications: true,
    emailOptOut: false,
    emailFrequency: 'immediate' as 'immediate' | 'daily' | 'weekly',
    preferredLanguage: 'en-GB'
  });

  // Update forms when data loads
  React.useEffect(() => {
    if (systemSettings) {
      setGeneralForm(systemSettings.general);
      setSecurityForm(systemSettings.security);
      setNotificationForm(systemSettings.notifications);
      setIntegrationForm(systemSettings.integrations);
    }
  }, [systemSettings]);

  React.useEffect(() => {
    if (personalSettings) {
      setPersonalForm({
        ...personalSettings.emailPreferences,
        preferredLanguage: personalSettings.general.preferredLanguage
      });
    }
  }, [personalSettings]);

  // Form handlers
  const handleSaveGeneral = async () => {
    try {
      await updateGeneralSettings.mutateAsync(generalForm);
      toast.success('General settings updated successfully');
    } catch (error) {
      toast.error('Failed to update general settings');
    }
  };

  const handleSaveSecurity = async () => {
    try {
      await updateSecuritySettings.mutateAsync(securityForm);
      toast.success('Security settings updated successfully');
    } catch (error) {
      toast.error('Failed to update security settings');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await updateNotificationSettings.mutateAsync(notificationForm);
      toast.success('Notification settings updated successfully');
    } catch (error) {
      toast.error('Failed to update notification settings');
    }
  };

  const handleSaveIntegrations = async () => {
    try {
      await updateIntegrationSettings.mutateAsync(integrationForm);
      toast.success('Integration settings updated successfully');
    } catch (error) {
      toast.error('Failed to update integration settings');
    }
  };

  const handleSavePersonal = async () => {
    try {
      await updatePersonalSettings.mutateAsync({
        emailPreferences: {
          messageNotifications: personalForm.messageNotifications,
          propertyInquiries: personalForm.propertyInquiries,
          systemNotifications: personalForm.systemNotifications,
          emailOptOut: personalForm.emailOptOut,
          emailFrequency: personalForm.emailFrequency
        },
        general: {
          preferredLanguage: personalForm.preferredLanguage
        }
      });
      toast.success('Personal settings updated successfully');
    } catch (error) {
      toast.error('Failed to update personal settings');
    }
  };

  // If not admin, show access denied
  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
          {/* Assuming 'errors.notFound.title' and similar are in common.json and will need a different t function or key copying */}
          {/* For Option 1, these keys need to be in dashboard.json or this t call won't work */}
          <h1 className="text-2xl font-bold mb-4">{t('common:errors.notFound.title')}</h1>
          <p className="text-gray-600 text-center mb-6">{t('common:errors.notFound.message')}</p>
          <p className="text-gray-500 text-center mb-6">{t('common:errors.notFound.hint')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {user?.role === 'admin' ? t('admin.systemSettings') : 'Personal Settings'}
            </h1>
            <p className="text-muted-foreground">
              {user?.role === 'admin' ? t('admin.manageSystemSettings') : 'Manage your personal preferences'}
            </p>
          </div>
          {user?.role === 'admin' && (
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? '🟢 Live' : '🔴 Offline'}
              </Badge>
            </div>
          )}
        </div>

        <Tabs defaultValue={user?.role === 'admin' ? 'general' : 'personal'} className="space-y-4">
          <TabsList>
            {user?.role === 'admin' && (
              <>
                <TabsTrigger value="general">{t('admin.general')}</TabsTrigger>
                <TabsTrigger value="security">{t('admin.security')}</TabsTrigger>
                <TabsTrigger value="notifications">{t('admin.notifications')}</TabsTrigger>
                <TabsTrigger value="integrations">{t('admin.integrations')}</TabsTrigger>
              </>
            )}
            <TabsTrigger value="personal">Personal</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.generalSettings')}</CardTitle>
                <CardDescription>
                  {t('admin.manageGeneralSettings')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">{t('admin.siteName')}</Label>
                  <Input 
                    id="siteName" 
                    value={generalForm.siteName}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">{t('admin.defaultLanguage')}</Label>
                  <Select 
                    value={generalForm.defaultLanguage}
                    onValueChange={(value) => setGeneralForm(prev => ({ ...prev, defaultLanguage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.nativeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="maintenance" 
                    checked={generalForm.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralForm(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                  <Label htmlFor="maintenance">{t('admin.maintenanceMode')}</Label>
                </div>
                <Button onClick={handleSaveGeneral} disabled={updateGeneralSettings.isPending}>
                  {updateGeneralSettings.isPending ? 'Saving...' : 'Save General Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.securitySettings')}</CardTitle>
                <CardDescription>
                  {t('admin.manageSecuritySettings')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="twoFactor" 
                    checked={securityForm.requireTwoFactor}
                    onCheckedChange={(checked) => setSecurityForm(prev => ({ ...prev, requireTwoFactor: checked }))}
                  />
                  <Label htmlFor="twoFactor">{t('admin.requireTwoFactor')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="emailVerification" 
                    checked={securityForm.requireEmailVerification}
                    onCheckedChange={(checked) => setSecurityForm(prev => ({ ...prev, requireEmailVerification: checked }))}
                  />
                  <Label htmlFor="emailVerification">{t('admin.requireEmailVerification')}</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">{t('admin.sessionTimeout')}</Label>
                  <Select 
                    value={securityForm.sessionTimeout.toString()}
                    onValueChange={(value) => setSecurityForm(prev => ({ ...prev, sessionTimeout: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.selectTimeout')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveSecurity} disabled={updateSecuritySettings.isPending}>
                  {updateSecuritySettings.isPending ? 'Saving...' : 'Save Security Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.notificationSettings')}</CardTitle>
                <CardDescription>
                  {t('admin.manageNotificationSettings')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="emailNotifications" 
                    checked={notificationForm.emailNotifications}
                    onCheckedChange={(checked) => setNotificationForm(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                  <Label htmlFor="emailNotifications">{t('admin.emailNotifications')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="pushNotifications" 
                    checked={notificationForm.pushNotifications}
                    onCheckedChange={(checked) => setNotificationForm(prev => ({ ...prev, pushNotifications: checked }))}
                  />
                  <Label htmlFor="pushNotifications">{t('admin.pushNotifications')}</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">{t('admin.notificationEmail')}</Label>
                  <Input 
                    id="notificationEmail" 
                    type="email" 
                    value={notificationForm.notificationEmail}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, notificationEmail: e.target.value }))}
                    placeholder="info@inmobi.mobi" 
                  />
                </div>
                <Button onClick={handleSaveNotifications} disabled={updateNotificationSettings.isPending}>
                  {updateNotificationSettings.isPending ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.integrationSettings')}</CardTitle>
                <CardDescription>
                  {t('admin.manageIntegrationSettings')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="googleMapsApiKey">{t('admin.googleMapsApiKey')}</Label>
                  <Input 
                    id="googleMapsApiKey" 
                    type="password" 
                    value={integrationForm.googleMapsApiKey}
                    onChange={(e) => setIntegrationForm(prev => ({ ...prev, googleMapsApiKey: e.target.value }))}
                    placeholder={systemSettings?.integrations.googleMapsApiKey ? "***configured***" : "Enter API key"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripeApiKey">{t('admin.stripeApiKey')}</Label>
                  <Input 
                    id="stripeApiKey" 
                    type="password" 
                    value={integrationForm.stripeApiKey}
                    onChange={(e) => setIntegrationForm(prev => ({ ...prev, stripeApiKey: e.target.value }))}
                    placeholder={systemSettings?.integrations.stripeApiKey ? "***configured***" : "Enter API key"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">{t('admin.smtpServer')}</Label>
                  <Input 
                    id="smtpServer" 
                    value={integrationForm.smtpServer}
                    onChange={(e) => setIntegrationForm(prev => ({ ...prev, smtpServer: e.target.value }))}
                    placeholder="smtp.example.com"
                  />
                </div>
                <Button onClick={handleSaveIntegrations} disabled={updateIntegrationSettings.isPending}>
                  {updateIntegrationSettings.isPending ? 'Saving...' : 'Save Integration Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Preferences</CardTitle>
                <CardDescription>
                  Manage your email notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="messageNotifications" 
                    checked={personalForm.messageNotifications}
                    onCheckedChange={(checked) => setPersonalForm(prev => ({ ...prev, messageNotifications: checked }))}
                  />
                  <Label htmlFor="messageNotifications">Message Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="propertyInquiries" 
                    checked={personalForm.propertyInquiries}
                    onCheckedChange={(checked) => setPersonalForm(prev => ({ ...prev, propertyInquiries: checked }))}
                  />
                  <Label htmlFor="propertyInquiries">Property Inquiry Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="systemNotifications" 
                    checked={personalForm.systemNotifications}
                    onCheckedChange={(checked) => setPersonalForm(prev => ({ ...prev, systemNotifications: checked }))}
                  />
                  <Label htmlFor="systemNotifications">System Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="emailOptOut" 
                    checked={personalForm.emailOptOut}
                    onCheckedChange={(checked) => setPersonalForm(prev => ({ ...prev, emailOptOut: checked }))}
                  />
                  <Label htmlFor="emailOptOut">Opt out of all emails</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailFrequency">Email Frequency</Label>
                  <Select 
                    value={personalForm.emailFrequency}
                    onValueChange={(value: 'immediate' | 'daily' | 'weekly') => setPersonalForm(prev => ({ ...prev, emailFrequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily digest</SelectItem>
                      <SelectItem value="weekly">Weekly digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>General Preferences</CardTitle>
                <CardDescription>
                  Manage your general account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredLanguage">Preferred Language</Label>
                  <Select 
                    value={personalForm.preferredLanguage}
                    onValueChange={(value) => setPersonalForm(prev => ({ ...prev, preferredLanguage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.nativeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSavePersonal} disabled={updatePersonalSettings.isPending}>
                  {updatePersonalSettings.isPending ? 'Saving...' : 'Save Personal Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 