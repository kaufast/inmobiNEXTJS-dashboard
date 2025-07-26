import React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { currentLanguage, changeLanguage, languages, getLanguageByCode } = useLanguage();
  const { t } = useTranslation(['common', 'dashboard']);
  const currentLang = getLanguageByCode(currentLanguage);
  
  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Globe className="h-4 w-4 mr-1" />
                <span className="sm:hidden flex items-center gap-1">
                  {currentLang?.flag}
                  <span className="text-xs">
                    {currentLanguage === 'en-GB' ? 'UK' : 
                     currentLanguage === 'en-US' ? 'US' : 
                     currentLanguage === 'es-MX' ? 'Mexico' : 
                     currentLanguage === 'ca-ES' ? 'Català' : 
                     currentLanguage === 'de-AT' ? 'Austria' :
                     currentLanguage === 'de-DE' ? 'Germany' :
                     currentLanguage === 'fr-FR' ? 'France' :
                     currentLanguage === 'es-ES' ? 'Spain' : 
                     currentLanguage.split('-')[1]}
                  </span>
                </span>
                <span className="hidden sm:inline">{currentLang?.flag} {currentLang?.nativeName}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Select language and country</p>
          </TooltipContent>
        </Tooltip>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <div className="text-xs text-muted-foreground px-2 py-1.5">
          {t('common:general.language.selectLanguage')}
        </div>
        <DropdownMenuSeparator />
        
        <div className="grid grid-cols-1 gap-1 py-1">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              className={`cursor-pointer flex items-center ${language.code === currentLanguage ? 'font-medium bg-muted' : ''}`}
              onClick={() => changeLanguage(language.code)}
            >
              <span className="mr-2 text-base">{language.flag}</span>
              <span className="flex-grow">{language.nativeName}</span>
              {language.code === currentLanguage && (
                <span className="ml-2 h-2 w-2 rounded-full bg-primary"></span>
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
    </TooltipProvider>
  );
}