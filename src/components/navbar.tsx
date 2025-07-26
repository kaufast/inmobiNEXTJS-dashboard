import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { getUrlWithLanguage } from "@/lib/i18n-util";

export function Navbar() {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const { t } = useTranslation('common');
  const [location, setLocation] = useLocation();

  // Function to get language-aware URLs
  const getUrl = (path: string) => {
    // Only add language prefix for non-default language
    if (currentLanguage !== "en-GB") {
      return `/${currentLanguage}${path}`;
    }
    return path;
  };

  // New handler to change language and update URL
  const handleLanguageChange = (lang: string) => {
    if (lang === currentLanguage) return;
    // Type assertion to handle LanguageCode type
    changeLanguage(lang as any);
    setLocation(getUrlWithLanguage(location, lang));
  };

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center space-x-4">
          <Link href={getUrl("/")} className="font-bold text-xl">
            inMobi
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <Link href={getUrl("/properties")} className="text-sm font-medium">
              {t('.properties')}
            </Link>
            <Link href={getUrl("/search")} className="text-sm font-medium">
              {t('.search')}
            </Link>
            <Link href={getUrl("/property-matching-chat")} className="text-sm font-medium">
              {t('.propertyMatchingChat')}
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={currentLanguage === lang.code ? "bg-accent" : ""}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.nativeName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href={getUrl("/login")}>
            <Button variant="ghost">{t('.login')}</Button>
          </Link>
          <Link href={getUrl("/register")}>
            <Button>{t('.signUp')}</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
} 