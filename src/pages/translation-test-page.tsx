import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import i18n from '@/i18n';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getI18nInstance } from '../i18n';

export default function TranslationTestPage() {
  const { t } = useTranslation('common');
  const { currentLanguage, changeLanguage: updateLanguage, languages } = useLanguage();
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  
  // Get all supported languages from i18n
  const supportedLangs = i18n.options.supportedLngs || [];
  
  // Get all namespaces from i18n
  const namespaces = i18n.options.ns || [];
  
  // Test keys to check translation
  const testKeys = [
    'navbar.login',
    'footer.description',
    'hero.title',
    'general.home',
    'actions.submit',
    'errors.required',
    'notifications.success',
    'search.placeholder'
  ];
  
  useEffect(() => {
    // Run tests when language changes
    const runTests = async () => {
      const results: Record<string, any> = {};
      
      // Check if namespaces are loaded
      const loadedNamespaces = getI18nInstance().reportNamespaces?.getUsedNamespaces() || [];
      results.loadedNamespaces = loadedNamespaces;
      
      // Test backend path
      results.backendPath = i18n.options.backend?.loadPath;
      
      // Test keys
      const keyResults: Record<string, string> = {};
      testKeys.forEach(key => {
        try {
          keyResults[key] = i18n.t(key);
        } catch (error) {
          keyResults[key] = `ERROR: ${(error as Error).message}`;
        }
      });
      
      results.translations = keyResults;
      
      // Check for network requests
      try {
        const loadPath = i18n.options.backend?.loadPath as string;
        if (loadPath) {
          const testPath = loadPath
            .replace('{{lng}}', selectedLanguage)
            .replace('{{ns}}', 'common');
          
          const response = await fetch(testPath);
          results.networkTest = {
            url: testPath,
            status: response.status,
            ok: response.ok,
            text: response.ok ? await response.text() : null
          };
        }
      } catch (error) {
        results.networkTest = {
          error: (error as Error).message
        };
      }
      
      setTestResults(results);
    };
    
    runTests();
  }, [selectedLanguage]);
  
  const switchLanguage = (lng: string) => {
    i18n.changeLanguage(lng).then(() => {
      setSelectedLanguage(lng);
    });
  };

  const debugTranslation = () => {
    const info = {
      currentLanguage: i18n.language,
      availableLanguages: i18n.languages,
      isInitialized: i18n.isInitialized,
      resourceBundles: {
        'en-GB': {
          common: i18n.hasResourceBundle('en-GB', 'common')
        }
      },
      loadPath: i18n.options.backend ? (i18n.options.backend as any).loadPath : undefined,
      translationExample: {
        'navbar.login': t('navbar.login'),
        'general.home': t('general.home'),
        'hero.title': t('hero.title')
      }
    };
    
    console.log(JSON.stringify(info, null, 2));
  };

  const forceReload = async (lang: string) => {
    try {
      await i18n.reloadResources(lang, ['common']);
      switchLanguage(lang as any);
      debugTranslation();
    } catch (error: any) {
      console.error('Force reload error:', error);
      console.log(`Error: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Translation Debug Page</CardTitle>
            <CardDescription>
              Test and debug i18n translations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Current Language: {currentLanguage}</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={lang.code === currentLanguage ? "default" : "outline"}
                      onClick={() => switchLanguage(lang.code)}
                    >
                      {lang.flag} {lang.nativeName}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Test Translations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Common Namespace</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Login: {t('navbar.login')}</p>
                      <p>Home: {t('general.home')}</p>
                      <p>Language: {t('general.language')}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Debug Information</h3>
                <Button onClick={debugTranslation} className="mb-4">
                  Show Debug Info
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Force Reload</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant="outline"
                      onClick={() => forceReload(lang.code)}
                    >
                      Reload {lang.flag} {lang.nativeName}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Configuration</h3>
                <div className="bg-gray-100 p-4 rounded">
                  <p><strong>Current Language:</strong> {i18n.language}</p>
                  <p><strong>Backend Path:</strong> {testResults.backendPath}</p>
                  <p><strong>Loaded Namespaces:</strong> {testResults.loadedNamespaces?.join(', ') || 'None'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Network Test</h3>
                <div className="bg-gray-100 p-4 rounded">
                  {testResults.networkTest ? (
                    <>
                      <p><strong>URL:</strong> {testResults.networkTest.url}</p>
                      <p><strong>Status:</strong> {testResults.networkTest.status}</p>
                      <p><strong>OK:</strong> {testResults.networkTest.ok ? 'Yes' : 'No'}</p>
                      {testResults.networkTest.error && (
                        <p><strong>Error:</strong> {testResults.networkTest.error}</p>
                      )}
                      {testResults.networkTest.text && (
                        <details>
                          <summary>Response Text</summary>
                          <pre className="bg-black text-white p-2 mt-2 rounded overflow-auto text-xs">
                            {testResults.networkTest.text}
                          </pre>
                        </details>
                      )}
                    </>
                  ) : (
                    <p>Running network test...</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}