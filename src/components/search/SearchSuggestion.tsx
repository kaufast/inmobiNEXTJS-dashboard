import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import stringSimilarity from 'string-similarity';
import { getLocationsByLocale, getAllLocations, isPostalCode, getCityFromPostalCode } from '@/data/location-dictionary';

// Simplified version for faster loading and better performance
interface SearchSuggestionProps {
  searchQuery: string;
  locale: string;
  onSuggestionClick: (suggestion: string) => void;
}

/**
 * A component that shows "Did you mean...?" suggestions for misspelled search terms
 */
const SearchSuggestion: React.FC<SearchSuggestionProps> = ({
  searchQuery,
  locale,
  onSuggestionClick
}) => {
  const { t } = useTranslation('search');
  const [suggestion, setSuggestion] = React.useState<string | null>(null);
  const [suggestedTerm, setSuggestedTerm] = React.useState<string | null>(null);
  
  // Memoize search to avoid costly recalculations
  React.useEffect(() => {
    // Performance optimization: only run for queries with at least 3 characters
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestion(null);
      setSuggestedTerm(null);
      return;
    }
    
    // Debounce suggestion calculation to avoid performance issues
    const timer = setTimeout(() => {
      try {
        // Check if the query is a postal code first
        if (isPostalCode(searchQuery)) {
          const postalCodeResult = getCityFromPostalCode(searchQuery);
          if (postalCodeResult) {
            // Suggest the city name for postal code searches
            const cityCountryName = `${postalCodeResult.city}, ${postalCodeResult.country}`;
            setSuggestion(t('search.didYouMean', { suggestion: cityCountryName }));
            setSuggestedTerm(cityCountryName);
            return;
          }
        }
        
        // Filter locations by locale for more relevant suggestions
        const knownLocations = getLocationsByLocale(locale) || getAllLocations();
        
        // Direct implementation without dependency on getSearchSuggestion
        const normalizedQuery = searchQuery.toLowerCase();
        const bestMatches = knownLocations
          .filter(location => location.toLowerCase() !== normalizedQuery)
          .map(location => ({
            term: location,
            similarity: stringSimilarity.compareTwoStrings(normalizedQuery, location.toLowerCase())
          }))
          .filter(match => match.similarity > 0.5)
          .sort((a, b) => b.similarity - a.similarity);
          
        if (bestMatches.length > 0) {
          const bestMatch = bestMatches[0].term;
          
          // Use i18n translation for the suggestion message
          setSuggestion(t('search.didYouMean', { suggestion: bestMatch }));
          setSuggestedTerm(bestMatch);
        } else {
          setSuggestion(null);
          setSuggestedTerm(null);
        }
      } catch (error) {
        console.error('Error generating search suggestion:', error);
        setSuggestion(null);
        setSuggestedTerm(null);
      }
    }, 300); // 300ms delay to avoid excessive calculations
    
    return () => clearTimeout(timer);
  }, [searchQuery, locale, t]);
  
  if (!suggestion || !suggestedTerm) {
    return null;
  }
  
  return (
    <div className="p-4 bg-white rounded-md shadow-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-black font-medium">{suggestion}</span>
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-2 bg-black text-white hover:bg-white hover:text-black border border-black transition-all"
          onClick={() => onSuggestionClick(suggestedTerm)}
        >
          {t('search.useSuggestion')}
        </Button>
      </div>
    </div>
  );
};

export default SearchSuggestion;