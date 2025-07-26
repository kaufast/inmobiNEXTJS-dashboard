import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TranslationTest() {
  const { t, i18n } = useTranslation('common');
  
  const testKeys = [
    'general.featured',
    'premiumProperty.featured',
    'featuredProperties.featured'
  ];
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">Featured Translation Test</h2>
      <p className="mb-2">Current Language: {i18n.language}</p>
      <p className="mb-2">Available Languages: {i18n.languages?.join(', ')}</p>
      <div className="space-y-2">
        {testKeys.map(key => (
          <div key={key} className="flex justify-between">
            <span className="font-mono text-sm">{key}:</span>
            <span className="font-medium">{t(key)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 p-2 bg-gray-100 rounded">
        <p className="text-sm font-bold">General Section:</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify((i18n.store?.data?.[i18n.language]?.common as any)?.general, null, 2)}
        </pre>
      </div>
    </div>
  );
} 