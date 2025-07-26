import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { Mic, MapPin, Search, Sliders, Wand2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import SearchSuggestion from "./SearchSuggestion";

interface SearchBarProps {
  className?: string;
  initialQuery?: string;
  onSearch?: (query: string) => void;
  showOptions?: boolean;
}

export default function SearchBar({ className, initialQuery = "", onSearch, showOptions = true }: SearchBarProps) {
  const { t } = useTranslation('search');
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { currentLanguage } = useLanguage();

  // Reset search query when initialQuery changes (e.g., when navigating to search page with a new query)
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Use the custom search handler if provided
    if (onSearch) {
      onSearch(searchQuery.trim());
      setShowSuggestions(false);
      return;
    }
    
    // Default search behavior - navigate to search page
    let baseUrl = "/search";
    
    // Add language prefix if not default language
    if (currentLanguage !== 'en-GB') {
      baseUrl = `/${currentLanguage}/search`;
    }
    
    let url = `${baseUrl}?query=${encodeURIComponent(searchQuery.trim())}`;
    if (activeTab !== "all") {
      url += `&propertyType=${activeTab}`;
    }
    navigate(url);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    
    // Use the custom search handler if provided
    if (onSearch) {
      onSearch(suggestion);
      setShowSuggestions(false);
      return;
    }
    
    // Default suggestion click behavior
    let baseUrl = "/search";
    
    // Add language prefix if not default language
    if (currentLanguage !== 'en-GB') {
      baseUrl = `/${currentLanguage}/search`;
    }
    
    let url = `${baseUrl}?query=${encodeURIComponent(suggestion)}`;
    if (activeTab !== "all") {
      url += `&propertyType=${activeTab}`;
    }
    navigate(url);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Only show suggestions if there's at least 3 characters and query is not empty
    if (value && value.length >= 3) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleInputBlur = () => {
    // Use a timeout to allow click events on suggestions to fire before hiding them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <TooltipProvider>
      <div className={`${showOptions ? 'bg-[#2A2A2A]/90 backdrop-blur-lg shadow-lg p-4' : 'bg-transparent p-0'} rounded-xl ${className}`}>
      {/* Search input */}
      <div className="bg-white rounded-full shadow-md relative">
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="flex-grow relative pl-4">
            {/* Only show the MapPin icon if not in the search-results-page (determined by className prop) */}
            {!className?.includes('w-full') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 cursor-help">
                    <MapPin className="h-5 w-5 text-black" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search by location</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Input
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              className={`w-full border-none shadow-none focus-visible:ring-0 ${!className?.includes('w-full') ? 'pl-7' : 'pl-3'} bg-transparent`}
              value={searchQuery}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onFocus={() => searchQuery.length >= 3 && setShowSuggestions(true)}
            />
          </div>

          <div className="flex gap-1 px-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full h-10 w-10 p-0"
                  title={t('hero.voiceSearch')}
                  onClick={() => navigate("/voice-search")}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search using voice commands</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  className="rounded-full h-10 w-10 p-0 bg-black text-white hover:bg-white hover:text-black border border-black transition-all"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search properties</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </form>
        
        {/* Search suggestion for potential typos */}
        {showSuggestions && searchQuery.trim().length >= 3 && (
          <div className="absolute z-10 w-full left-0 top-full mt-1 rounded-lg shadow-lg">
            <SearchSuggestion 
              searchQuery={searchQuery}
              locale={currentLanguage}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        )}
      </div>

      {/* Search option buttons - only shown when showOptions is true */}
      {showOptions && (
        <div className="flex flex-wrap gap-2 mt-4 mx-auto bg-[#1D1D1D]/80 backdrop-blur-sm rounded-full p-1 max-w-fit">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("advanced")}
            title={t('hero.advanced')}
            className={`rounded-full h-10 w-10 p-0 ${activeTab === "advanced" ? "bg-[#131313] text-white" : "text-white"} hover:bg-[#131313] hover:text-white transition-all`}
          >
            <Sliders className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/voice-search")}
            title={t('hero.voiceSearch')}
            className="rounded-full h-10 w-10 p-0 text-white hover:bg-[#131313] hover:text-white transition-all"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/search-wizard")}
            title={t('hero.searchWizard')}
            className="rounded-full h-10 w-10 p-0 text-white hover:bg-[#131313] hover:text-white transition-all"
          >
            <Wand2 className="h-5 w-5" />
          </Button>
        </div>
      )}
      </div>
    </TooltipProvider>
  );
}