import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export const TranslationDebugger: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [missingKeys, setMissingKeys] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [currentNamespace, setCurrentNamespace] = useState<string>('common');
  const [namespaces, setNamespaces] = useState<string[]>([]);

  useEffect(() => {
    // Get available namespaces
    const availableNamespaces = Object.keys(i18n.services.resourceStore.data[i18n.language] || {});
    setNamespaces(availableNamespaces);

    // Setup a listener for missing keys
    const originalMissingKeyHandler = i18next.options.missingKeyHandler;

    i18next.options.missingKeyHandler = (lng: string[], ns: string, key: string) => {
      setMissingKeys(prev => {
        const fullKey = `${ns}:${key}`;
        return prev.includes(fullKey) ? prev : [...prev, fullKey];
      });
      
      if (originalMissingKeyHandler) {
        originalMissingKeyHandler(lng, ns, key);
      }
    };

    return () => {
      i18next.options.missingKeyHandler = originalMissingKeyHandler;
    };
  }, [i18n]);

  const clearMissingKeys = () => {
    setMissingKeys([]);
  };

  const handleNamespaceChange = (ns: string) => {
    setCurrentNamespace(ns);
  };

  const toggleDebugger = () => {
    setIsOpen(!isOpen);
  };

  const exportNamespaceKeys = () => {
    try {
      const resources = i18n.getResourceBundle(i18n.language, currentNamespace);
      // Create a blob of the JSON data
      const blob = new Blob([JSON.stringify(resources, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and click it to download the file
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentNamespace}_${i18n.language}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting namespace keys:', error);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        className="fixed bottom-4 right-4 z-50 rounded-full p-2" 
        variant="outline"
        onClick={toggleDebugger}
      >
        i18n
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">i18n Translation Debugger</CardTitle>
          <Button variant="ghost" size="sm" onClick={toggleDebugger} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-xs">
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="font-medium mr-2">Current language:</span>
            <span className="font-bold">{i18n.language}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {namespaces.map(ns => (
              <Button 
                key={ns}
                size="sm"
                variant={currentNamespace === ns ? "default" : "outline"}
                onClick={() => handleNamespaceChange(ns)}
                className="text-xs py-0 h-6"
              >
                {ns}
              </Button>
            ))}
          </div>
          
          <div className="flex justify-between mb-4">
            <Button size="sm" variant="outline" onClick={exportNamespaceKeys} className="text-xs">
              Export '{currentNamespace}'
            </Button>
            <Button size="sm" variant="outline" onClick={clearMissingKeys} className="text-xs">
              Clear missing
            </Button>
          </div>
        </div>
        
        {missingKeys.length > 0 ? (
          <div>
            <h3 className="font-medium mb-1 text-red-500">Missing translations ({missingKeys.length}):</h3>
            <ul className="list-disc pl-4 space-y-1">
              {missingKeys.map(key => (
                <li key={key} className="text-red-500">
                  {key}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-green-500">No missing translations detected.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranslationDebugger; 