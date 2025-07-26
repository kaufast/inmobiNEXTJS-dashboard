import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TranslationDebugger } from './TranslationDebugger';
import { TranslationKeysScanner } from './TranslationKeysScanner';
import { Sparkles } from 'lucide-react';

export const I18nDebugTools: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'debugger' | 'scanner'>('debugger');

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <Button
        className="fixed bottom-4 right-4 z-50 rounded-full"
        variant="outline"
        size="sm"
        onClick={toggleVisibility}
      >
        <Sparkles className="h-4 w-4 mr-1" />
        i18n Debug
      </Button>
    );
  }

  // Position the tools in different corners to avoid overlap
  const positionStyles = {
    debugger: 'bottom-4 right-4',
    scanner: 'bottom-4 left-4',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'debugger' | 'scanner')}
        className="w-96"
      >
        <div className="flex justify-between items-center mb-2 bg-card p-2 rounded-t-lg shadow">
          <TabsList>
            <TabsTrigger value="debugger" className="text-xs">Translation Debugger</TabsTrigger>
            <TabsTrigger value="scanner" className="text-xs">Key Scanner</TabsTrigger>
          </TabsList>
          <Button variant="ghost" size="sm" onClick={toggleVisibility} className="h-7 px-2 text-xs">
            Close
          </Button>
        </div>
        
        <TabsContent value="debugger" className="m-0">
          <div className="border rounded-b-lg overflow-hidden">
            <TranslationDebugger />
          </div>
        </TabsContent>
        
        <TabsContent value="scanner" className="m-0">
          <div className="border rounded-b-lg overflow-hidden">
            <TranslationKeysScanner />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default I18nDebugTools; 