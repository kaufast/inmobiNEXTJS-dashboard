import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Check, Copy } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Regex to match common i18n patterns: t('key'), t("key"), t('namespace:key'), etc.
// This isn't perfect but catches most translation key usages
const I18N_PATTERN = /(?:t|i18n\.t)\(\s*['"]([^'"]+)['"]\s*(?:,\s*(?:{[^}]*}|\[.*?\]|{[^{}]*}))?(?:|\))?\)?/g;

export const TranslationKeysScanner: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const [componentText, setComponentText] = useState('');
  const [scanResults, setScanResults] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const toggleScanner = () => {
    setIsOpen(!isOpen);
  };

  const scanForTranslationKeys = () => {
    try {
      const matches = [...componentText.matchAll(I18N_PATTERN)];
      const keys = matches.map(match => match[1]);
      // Remove duplicates
      const uniqueKeys = Array.from(new Set(keys));
      setScanResults(uniqueKeys);

      toast({
        title: "Scan Complete",
        description: `Found ${uniqueKeys.length} unique translation keys`,
      });
    } catch (error) {
      console.error('Error scanning for translation keys:', error);
      toast({
        title: "Scan Failed",
        description: "Error scanning component text",
        variant: "destructive",
      });
    }
  };

  const checkTranslationsExist = () => {
    const missing: string[] = [];
    
    scanResults.forEach(key => {
      let namespace = 'common';
      let translationKey = key;
      
      // Handle namespaced keys (e.g., 'namespace:key')
      if (key.includes(':')) {
        [namespace, translationKey] = key.split(':');
      }
      
      try {
        const translation = i18n.t(key);
        // If the translation equals the key, it's missing
        if (translation === key || translation === translationKey) {
          missing.push(key);
        }
      } catch (e) {
        missing.push(key);
      }
    });
    
    if (missing.length > 0) {
      setScanResults(missing);
      toast({
        title: "Missing Translations",
        description: `Found ${missing.length} missing translation keys`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "All Translations Found",
        description: "All keys have translations",
        variant: "default",
      });
    }
  };

  const copyToClipboard = () => {
    const formattedKeys = scanResults.map(key => `"${key}": "",`).join('\n');
    navigator.clipboard.writeText(formattedKeys);
    setCopied(true);
    
    toast({
      title: "Copied",
      description: "Translation keys copied to clipboard in JSON format",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) {
    return (
      <Button 
        className="fixed bottom-4 left-4 z-50 rounded-full p-2" 
        variant="outline"
        onClick={toggleScanner}
      >
        i18n Scan
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-96 max-h-[80vh] overflow-auto shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">Translation Keys Scanner</CardTitle>
          <Button variant="ghost" size="sm" onClick={toggleScanner} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-xs">
        <p className="mb-2">Paste component code to scan for translation keys:</p>
        <Textarea 
          value={componentText}
          onChange={(e) => setComponentText(e.target.value)}
          placeholder="Paste your component code here..."
          className="mb-2 h-32 text-xs"
        />
        
        <div className="flex space-x-2 mb-4">
          <Button 
            size="sm"
            onClick={scanForTranslationKeys}
            disabled={!componentText}
            className="text-xs flex-1"
          >
            Scan for Keys
          </Button>
          
          <Button 
            size="sm"
            onClick={checkTranslationsExist}
            disabled={scanResults.length === 0}
            className="text-xs flex-1"
            variant="outline"
          >
            Check Translations
          </Button>
        </div>
        
        {scanResults.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium">Found Keys ({scanResults.length}):</h3>
              <Button 
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="bg-muted p-2 rounded max-h-48 overflow-auto">
              {scanResults.map((key, index) => (
                <div key={index} className="text-xs my-1">
                  {key}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranslationKeysScanner; 