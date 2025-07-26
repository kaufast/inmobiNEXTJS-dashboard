import { usePropertyWizard } from "@/hooks/use-property-wizard";
import { QuestionCard } from "../QuestionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";

export function StepBasicInfo() {
  const { propertyData, updatePropertyData } = usePropertyWizard();
  const { t } = useTranslation('properties');

  return (
    <QuestionCard
      title={t('wizard.steps.basicInfo.title')}
      description={t('wizard.steps.basicInfo.description')}
      icon={<Pencil className="h-5 w-5" />}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base font-medium">{t('wizard.steps.basicInfo.titleLabel')}</Label>
          <Input
            id="title"
            placeholder={t('wizard.steps.basicInfo.titlePlaceholder')}
            value={propertyData.title}
            onChange={(e) => updatePropertyData({ title: e.target.value })}
            className="h-12 text-lg"
            required
          />
          <p className="text-sm text-muted-foreground mt-2">
            {t('wizard.steps.basicInfo.titleHelp')}
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-6">
          <h3 className="text-sm font-medium flex items-center gap-2 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lightbulb"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
            {t('wizard.steps.basicInfo.proTip')}
          </h3>
          <p className="text-sm mt-1 text-slate-600">
            {t('wizard.steps.basicInfo.proTipContent')}
          </p>
        </div>
      </div>
    </QuestionCard>
  );
}