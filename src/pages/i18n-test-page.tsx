import { useTranslation } from 'react-i18next';

export default function I18nTestPage() {
  const { t, i18n } = useTranslation('common, verification');
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">I18n Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <p>Current Language: <strong>{i18n.language}</strong></p>
        <p>Is Initialized: <strong>{i18n.isInitialized ? 'Yes' : 'No'}</strong></p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Auth Translations</h2>
          <ul className="space-y-2">
            <li><strong>verification.auth.welcome:</strong> {t('auth.welcome')}</li>
            <li><strong>verification.auth.login.title:</strong> {t('auth.login.title')}</li>
            <li><strong>verification.auth.register.title:</strong> {t('auth.register.title')}</li>
          </ul>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Agent Properties Translations</h2>
          <ul className="space-y-2">
            <li><strong>agentProperties.title:</strong> {t('agentProperties.title')}</li>
            <li><strong>agentProperties.description:</strong> {t('agentProperties.description')}</li>
            <li><strong>agentProperties.tabs.all:</strong> {t('agentProperties.tabs.all')}</li>
          </ul>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Debug Translations</h2>
          <ul className="space-y-2">
            <li><strong>debug.title:</strong> {t('debug.title')}</li>
            <li><strong>debug.infoTitle:</strong> {t('debug.infoTitle')}</li>
            <li><strong>debug.description:</strong> {t('debug.description')}</li>
          </ul>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-4">General Translations</h2>
          <ul className="space-y-2">
            <li><strong>general.loading:</strong> {t('general.loading')}</li>
            <li><strong>general.error:</strong> {t('general.error')}</li>
            <li><strong>general.retry:</strong> {t('general.retry')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 