import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, CheckCircle, FileText, HelpCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';

export default function VerificationGuidePage() {
  const { t } = useTranslation('auth');

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('verification_guide_title')}</h1>
          <p className="text-muted-foreground mt-1">{t('verification_guide_description')}</p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/verification">
            {t('verification_guide_back')}
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('verification_guide_overview')}</TabsTrigger>
          <TabsTrigger value="user">{t('verification_guide_user')}</TabsTrigger>
          <TabsTrigger value="agency">{t('verification_guide_agency')}</TabsTrigger>
          <TabsTrigger value="faq">{t('verification_guide_faq')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-black" />
                <CardTitle>{t('verification_guide_benefits')}</CardTitle>
              </div>
              <CardDescription>{t('verification_guide_benefits_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-black text-white">
                    1
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-medium">{t('verification_guide_step_choose_type')}</h3>
                    <p className="text-sm text-muted-foreground">{t('verification_guide_step_choose_type_description')}</p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-black text-white">
                    2
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-medium">{t('verification_guide_step_select_method')}</h3>
                    <p className="text-sm text-muted-foreground">{t('verification_guide_step_select_method_description')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-black" />
                <CardTitle>{t('verification_guide_process')}</CardTitle>
              </div>
              <CardDescription>{t('verification_guide_process_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">{t('verification_guide_digital_verification')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('verification_guide_digital_verification_description')}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">{t('verification_guide_fast')}</h4>
                        <p className="text-xs text-muted-foreground">{t('verification_guide_fast_description')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">{t('verification_guide_secure')}</h4>
                        <p className="text-xs text-muted-foreground">{t('verification_guide_secure_description')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-black" />
                <CardTitle>{t('verification_guide_user_verification')}</CardTitle>
              </div>
              <CardDescription>{t('verification_guide_user_verification_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">{t('verification_guide_user_timeline')}</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row gap-3 items-start">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-black text-white text-xs">
                        1
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{t('verification_guide_user_step_submission')}</h4>
                        <p className="text-xs text-muted-foreground">{t('verification_guide_user_step_submission_description')}</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 items-start">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-black text-white text-xs">
                        2
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{t('verification_guide_user_step_verification')}</h4>
                        <p className="text-xs text-muted-foreground">{t('verification_guide_user_step_verification_description')}</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 items-start">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-black text-white text-xs">
                        3
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{t('verification_guide_user_step_approval')}</h4>
                        <p className="text-xs text-muted-foreground">{t('verification_guide_user_step_approval_description')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agency" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-black" />
                <CardTitle>{t('verification_guide_agency_verification')}</CardTitle>
              </div>
              <CardDescription>{t('verification_guide_agency_verification_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">{t('verification_guide_agency_timeline')}</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row gap-3 items-start">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-black text-white text-xs">
                        1
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{t('verification_guide_agency_step_submission')}</h4>
                        <p className="text-xs text-muted-foreground">{t('verification_guide_agency_step_submission_description')}</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 items-start">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-black text-white text-xs">
                        2
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{t('verification_guide_agency_step_initial_review')}</h4>
                        <p className="text-xs text-muted-foreground">{t('verification_guide_agency_step_initial_review_description')}</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 items-start">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-black text-white text-xs">
                        3
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{t('verification_guide_agency_step_verification')}</h4>
                        <p className="text-xs text-muted-foreground">{t('verification_guide_agency_step_verification_description')}</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 items-start">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-black text-white text-xs">
                        4
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{t('verification_guide_agency_step_approval')}</h4>
                        <p className="text-xs text-muted-foreground">{t('verification_guide_agency_step_approval_description')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-black" />
                <CardTitle>{t('verification_guide_faq_title')}</CardTitle>
              </div>
              <CardDescription>{t('verification_guide_faq_description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-1.5">{t('verification_guide_faq_required')}</h3>
                  <p className="text-sm text-muted-foreground">{t('verification_guide_faq_required_answer')}</p>
                </div>
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-1.5">{t('verification_guide_faq_time')}</h3>
                  <p className="text-sm text-muted-foreground">{t('verification_guide_faq_time_answer')}</p>
                </div>
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-1.5">{t('verification_guide_faq_security')}</h3>
                  <p className="text-sm text-muted-foreground">{t('verification_guide_faq_security_answer')}</p>
                </div>
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-1.5">{t('verification_guide_faq_rejection')}</h3>
                  <p className="text-sm text-muted-foreground">{t('verification_guide_faq_rejection_answer')}</p>
                </div>
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-1.5">{t('verification_guide_faq_validity')}</h3>
                  <p className="text-sm text-muted-foreground">{t('verification_guide_faq_validity_answer')}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1.5">{t('verification_guide_faq_both_types')}</h3>
                  <p className="text-sm text-muted-foreground">{t('verification_guide_faq_both_types_answer')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-black" />
                <CardTitle>{t('verification_guide_need_help')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{t('verification_guide_need_help_description')}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" asChild>
                  <Link href="/verification">
                    {t('verification_guide_back')}
                  </Link>
                </Button>
                <Button asChild className="bg-black text-white hover:bg-white hover:text-black">
                  <a href="mailto:support@inmobi.mobi">
                    {t('verification_guide_contact_support')}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}