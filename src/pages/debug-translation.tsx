import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function DebugTranslationPage() {
  const { t, i18n } = useTranslation('common');
  
  const testFeatured = () => {
    console.log('Current language:', i18n.language);
    console.log('Featured translation:', t('general.featured'));
    console.log('General section:', i18n.store?.data?.[i18n.language]?.common?.general);
  };
  
  const changeToSpanish = () => {
    i18n.changeLanguage('es-ES');
  };
  
  const changeToEnglish = () => {
    i18n.changeLanguage('en-US');
  };
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Translation Debug</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Current Language: {i18n.language}</h2>
          <div className="flex gap-2 mb-4">
            <Button onClick={changeToSpanish}>Switch to Spanish</Button>
            <Button onClick={changeToEnglish}>Switch to English</Button>
            <Button onClick={testFeatured}>Test Featured</Button>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Featured Translation Test:</h3>
          <div className="space-y-2">
            <div>
              <strong>general.featured:</strong> <span className="font-mono">{t('general.featured')}</span>
            </div>
            <div>
              <strong>premiumProperty.featured:</strong> <span className="font-mono">{t('premiumProperty.featured')}</span>
            </div>
            <div>
              <strong>featuredProperties.featured:</strong> <span className="font-mono">{t('featuredProperties.featured')}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Raw Translation Data:</h3>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(i18n.store?.data?.[i18n.language]?.common?.general, null, 2)}
          </pre>
        </div>
        
        <div className="bg-black text-white p-6 rounded-3xl">
          <div className="flex space-x-2 mb-4">
            <div className="bg-gray-800 text-white rounded-full px-3 py-1 flex items-center justify-center">
              <span className="text-xs">{t('general.featured')}</span>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2 text-white">Dormitorio</h3>
          <p className="text-sm text-gray-300 mb-4">
            Dormitorios cómodos y espaciosos con todas las comodidades.
          </p>
        </div>
      </div>
    </div>
  );
} 