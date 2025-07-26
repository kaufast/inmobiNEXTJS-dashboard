import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const SearchWizardPage: React.FC = () => {
  const { t } = useTranslation(['properties', 'search' ]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: '',
    budget: 0,
    location: '',
    bedrooms: 0,
    amenities: []
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('wizard.title')}</h3>
            <Select onValueChange={(value) => setFormData({ ...formData, propertyType: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('property.wizard.steps.pricing.selectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="house">{t('types.house')}</SelectItem>
                <SelectItem value="apartment">{t('types.apartment')}</SelectItem>
                <SelectItem value="villa">{t('types.villa')}</SelectItem>
                <SelectItem value="studio">{t('types.studio')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('wizard.budget')}</h3>
            <div className="space-y-6">
              <Slider
                defaultValue={[0]}
                max={1000000}
                step={1000}
                onValueChange={(value) => setFormData({ ...formData, budget: value[0] })}
                className="w-full"
              />
              <div className="text-center text-lg">
                {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(formData.budget)}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('wizard.location')}</h3>
            <Input 
              placeholder={t('wizard.enterLocation')}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full"
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('wizard.bedrooms')}</h3>
            <Select onValueChange={(value) => setFormData({ ...formData, bedrooms: parseInt(value) })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('wizard.selectBedrooms')} />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {t('wizard.bedrooms')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('wizard.summary')}</h3>
            <div className="space-y-2">
              <p><strong>{t('wizard.propertyType')}:</strong> {formData.propertyType}</p>
              <p><strong>{t('wizard.budget')}:</strong> {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(formData.budget)}</p>
              <p><strong>{t('wizard.location')}:</strong> {formData.location}</p>
              <p><strong>{t('wizard.bedrooms')}:</strong> {formData.bedrooms}</p>
            </div>
            <Button 
              className="w-full mt-4 bg-black text-white hover:bg-white hover:text-black border border-black" 
              onClick={() => console.log('Search properties', formData)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t('wizard.findProperties')}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Container className="py-8">
      <Card className="max-w-2xl mx-auto bg-white">
        <CardHeader>
          <CardTitle className="text-black">{t('wizard.title')}</CardTitle>
          <CardDescription className="text-gray-600">
            {t('wizard.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="border-black text-black hover:bg-black hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('general.back')}
              </Button>
              
              {currentStep < totalSteps && (
                <Button 
                  onClick={handleNext}
                  className="bg-black text-white hover:bg-white hover:text-black border border-black"
                >
                  {t('general.next')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
            
            <div className="flex justify-center mt-4">
              <p className="text-sm text-gray-500">
                {t('wizard.navigation.step')} {currentStep} {t('wizard.navigation.of')} {totalSteps}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SearchWizardPage; 