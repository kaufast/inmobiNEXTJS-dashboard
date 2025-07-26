/**
 * Property SEO Enhancer Component
 * Integrates all enhanced structured data for property pages
 */

import React from 'react';
import { 
  FAQSchema, 
  PriceHistorySchema, 
  VirtualTourSchema, 
  AgentReviewSchema,
  InvestmentAnalysisSchema,
  NeighborhoodSchema
} from './EnhancedStructuredData';
import { 
  generatePropertyFAQs, 
  generateMockPriceHistory, 
  generateMockAgentReviews,
  calculateAgentRatingStats,
  generateVirtualTourData
} from '@/lib/seo-data-generators';

interface PropertySEOEnhancerProps {
  property: any;
  locale?: string;
  includeComponents?: {
    faq?: boolean;
    priceHistory?: boolean;
    virtualTour?: boolean;
    agentReviews?: boolean;
    investment?: boolean;
    neighborhood?: boolean;
  };
}

export function PropertySEOEnhancer({ 
  property, 
  locale = 'en-US', 
  includeComponents = {
    faq: true,
    priceHistory: true,
    virtualTour: true,
    agentReviews: true,
    investment: false, // Disabled by default as it requires specific data
    neighborhood: true
  }
}: PropertySEOEnhancerProps) {
  
  // Generate FAQ data
  const faqData = includeComponents.faq ? generatePropertyFAQs(property, locale) : null;
  
  // Generate price history data
  const priceHistoryData = includeComponents.priceHistory ? generateMockPriceHistory(property) : null;
  
  // Generate virtual tour data
  const virtualTourData = includeComponents.virtualTour ? generateVirtualTourData(property) : null;
  
  // Generate agent reviews data
  const agentReviewsData = includeComponents.agentReviews && property.agent 
    ? generateMockAgentReviews(property.agent.id) 
    : null;
  
  const agentRatingStats = agentReviewsData ? calculateAgentRatingStats(agentReviewsData) : null;
  
  // Generate investment analysis data (if enabled and data available)
  const investmentData = includeComponents.investment && property.investment ? {
    propertyId: property.id,
    expectedReturn: property.investment.expectedReturn || 8.5,
    paybackPeriod: property.investment.paybackPeriod || 12,
    rentalYield: property.investment.rentalYield || 5.2,
    appreciation: property.investment.appreciation || 3.8,
    marketTrends: property.investment.marketTrends || ['rising prices', 'high demand', 'good location'],
    investmentRisk: property.investment.risk || 'medium' as const,
    analysisDate: new Date().toISOString().split('T')[0]
  } : null;

  // Generate neighborhood data
  const neighborhoodData = includeComponents.neighborhood && property.neighborhood ? {
    name: property.neighborhood.name,
    city: property.city || property.location?.city || 'Unknown',
    country: property.country || property.location?.country || 'Unknown',
    description: property.neighborhood.description || `${property.neighborhood.name} is a vibrant neighborhood with excellent amenities and transportation connections.`,
    averagePrice: property.neighborhood.averagePrice || property.price || 500000,
    currency: property.currency || 'EUR',
    walkScore: property.neighborhood.walkScore,
    crimeRate: property.neighborhood.crimeRate,
    schools: property.neighborhood.schools || [],
    amenities: property.neighborhood.amenities || ['restaurants', 'shopping', 'parks', 'public transport'],
    transportation: property.transportation || ['bus', 'metro', 'train']
  } : null;

  return (
    <>
      {/* FAQ Schema */}
      {faqData && faqData.length > 0 && (
        <FAQSchema faqs={faqData} />
      )}

      {/* Price History Schema */}
      {priceHistoryData && priceHistoryData.length > 0 && (
        <PriceHistorySchema 
          propertyId={property.id}
          propertyName={property.title}
          priceHistory={priceHistoryData}
        />
      )}

      {/* Virtual Tour Schema */}
      {virtualTourData && (
        <VirtualTourSchema 
          propertyId={property.id}
          propertyName={property.title}
          virtualTour={virtualTourData}
        />
      )}

      {/* Agent Reviews Schema */}
      {agentReviewsData && agentRatingStats && property.agent && (
        <AgentReviewSchema 
          agentId={property.agent.id}
          agentName={property.agent.name}
          agentImage={property.agent.image}
          agentUrl={property.agent.url}
          reviews={agentReviewsData}
          averageRating={agentRatingStats.averageRating}
          totalReviews={agentRatingStats.totalReviews}
        />
      )}

      {/* Investment Analysis Schema */}
      {investmentData && (
        <InvestmentAnalysisSchema 
          propertyId={property.id}
          propertyName={property.title}
          analysis={investmentData}
        />
      )}

      {/* Neighborhood Schema */}
      {neighborhoodData && (
        <NeighborhoodSchema neighborhood={neighborhoodData} />
      )}
    </>
  );
}

// Search Results SEO Enhancer for search/listing pages
interface SearchResultsSEOEnhancerProps {
  searchResults: any[];
  searchQuery?: string;
  location?: string;
  locale?: string;
}

export function SearchResultsSEOEnhancer({ 
  searchResults, 
  searchQuery, 
  location, 
  locale = 'en-US' 
}: SearchResultsSEOEnhancerProps) {
  
  // Generate FAQs for search results
  const searchFAQs = React.useMemo(() => {
    const faqs = [];
    
    if (searchQuery) {
      faqs.push({
        question: `How many properties are available for "${searchQuery}"?`,
        answer: `We currently have ${searchResults.length} properties available matching your search criteria for "${searchQuery}".`
      });
    }

    if (location) {
      faqs.push({
        question: `What is the average price in ${location}?`,
        answer: `The average price for properties in ${location} varies based on property type, size, and specific location. Contact our agents for current market pricing.`
      });
      
      faqs.push({
        question: `What amenities are available in ${location}?`,
        answer: `${location} offers various amenities including restaurants, shopping centers, parks, schools, and excellent transportation connections.`
      });
    }

    faqs.push({
      question: 'How often are new properties added?',
      answer: 'New properties are added to our listings daily. We recommend checking back regularly or setting up alerts for your preferred criteria.'
    });

    faqs.push({
      question: 'Can I schedule viewings for multiple properties?',
      answer: 'Yes, you can schedule viewings for multiple properties. Our agents can help coordinate visits to make the most of your time.'
    });

    return faqs;
  }, [searchResults, searchQuery, location]);

  return (
    <>
      {searchFAQs.length > 0 && (
        <FAQSchema faqs={searchFAQs} />
      )}
    </>
  );
}

// Agency/Agent Profile SEO Enhancer
interface AgentProfileSEOEnhancerProps {
  agent: any;
  locale?: string;
}

export function AgentProfileSEOEnhancer({ agent, locale = 'en-US' }: AgentProfileSEOEnhancerProps) {
  
  // Generate agent-specific FAQs
  const agentFAQs = React.useMemo(() => {
    const faqs = [];
    
    faqs.push({
      question: `What areas does ${agent.name} specialize in?`,
      answer: agent.specializations 
        ? `${agent.name} specializes in ${agent.specializations.join(', ')}.`
        : `${agent.name} has extensive experience in the local real estate market.`
    });

    faqs.push({
      question: `How can I contact ${agent.name}?`,
      answer: `You can contact ${agent.name} through phone, email, or by using the contact form on this page. Response time is typically within 24 hours.`
    });

    faqs.push({
      question: `What languages does ${agent.name} speak?`,
      answer: agent.languages 
        ? `${agent.name} speaks ${agent.languages.join(', ')}.`
        : `${agent.name} is fluent in multiple languages to serve our diverse clientele.`
    });

    faqs.push({
      question: `How long has ${agent.name} been working in real estate?`,
      answer: agent.experience 
        ? `${agent.name} has ${agent.experience} years of experience in real estate.`
        : `${agent.name} has extensive experience in the real estate industry.`
    });

    return faqs;
  }, [agent]);

  // Generate agent reviews
  const agentReviews = generateMockAgentReviews(agent.id);
  const ratingStats = calculateAgentRatingStats(agentReviews);

  return (
    <>
      {agentFAQs.length > 0 && (
        <FAQSchema faqs={agentFAQs} />
      )}
      
      <AgentReviewSchema 
        agentId={agent.id}
        agentName={agent.name}
        agentImage={agent.image}
        agentUrl={agent.url}
        reviews={agentReviews}
        averageRating={ratingStats.averageRating}
        totalReviews={ratingStats.totalReviews}
      />
    </>
  );
}

export default PropertySEOEnhancer;