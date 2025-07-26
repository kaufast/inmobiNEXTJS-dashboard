import React from 'react';
import { Property } from '@shared/schema';

interface EnhancedSEOProps {
  property?: Property;
  page?: 'home' | 'search' | 'property' | 'agent' | 'about';
  title?: string;
  description?: string;
  keywords?: string;
  location?: string;
  propertyType?: string;
  locale?: string;
}

// LLM-optimized content templates
const generateLLMContent = (props: EnhancedSEOProps) => {
  const { property, page, location, propertyType, locale = 'en-US' } = props;
  
  switch (page) {
    case 'property':
      if (!property) return null;
      
      return {
        title: `${property.title} - ${property.bedrooms} Bed ${property.propertyType} for ${property.listingType} in ${property.city} | Inmobi`,
        description: `Find your perfect ${property.propertyType} in ${property.city}. ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, ${property.squareFeet} sqft. ${property.description?.slice(0, 100)}... Contact our expert agents today.`,
        faqSchema: generatePropertyFAQ(property),
        conversationalContent: generateConversationalContent(property)
      };
      
    case 'search':
      return {
        title: `${propertyType || 'Properties'} for Sale & Rent in ${location || 'Spain'} | Inmobi Real Estate`,
        description: `Browse ${propertyType || 'properties'} in ${location || 'Spain'}. Find houses, apartments, villas with detailed photos, virtual tours, and expert agent assistance. Start your property search today.`,
        faqSchema: generateSearchFAQ(location, propertyType),
        conversationalContent: generateSearchConversationalContent(location, propertyType)
      };
      
    case 'home':
      return {
        title: 'Find Your Dream Property - Real Estate Search Platform | Inmobi',
        description: 'Discover properties for sale and rent across Spain. Advanced search, virtual tours, expert agents, and comprehensive property listings. Start your property journey with Inmobi today.',
        faqSchema: generateHomeFAQ(),
        conversationalContent: generateHomeConversationalContent()
      };
      
    default:
      return null;
  }
};

// Generate property-specific FAQ for LLM optimization
const generatePropertyFAQ = (property: Property) => {
  const faqs = [
    {
      question: `What makes this ${property.propertyType} in ${property.city} special?`,
      answer: `This ${property.propertyType} offers ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms in ${property.city}. ${property.description?.slice(0, 200)}...`
    },
    {
      question: `How much does this property cost?`,
      answer: `This property is available for ${property.listingType} at ${property.price?.toLocaleString()} EUR. Contact our agents for detailed pricing information and viewing arrangements.`
    },
    {
      question: `What amenities are included?`,
      answer: `This property includes: ${property.features?.slice(0, 5).join(', ')}. Additional amenities may be available - contact us for complete details.`
    },
    {
      question: `Can I schedule a viewing?`,
      answer: `Yes, you can schedule a viewing through our platform. We offer both physical tours and virtual tours. Contact our expert agents to arrange your preferred viewing time.`
    }
  ];
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

// Generate search-specific FAQ
const generateSearchFAQ = (location?: string, propertyType?: string) => {
  const faqs = [
    {
      question: `What ${propertyType || 'properties'} are available in ${location || 'Spain'}?`,
      answer: `We have a wide selection of ${propertyType || 'properties'} in ${location || 'Spain'} including apartments, houses, villas, and commercial properties. Use our advanced search filters to find your perfect match.`
    },
    {
      question: `How do I search for properties?`,
      answer: `Use our advanced search filters to find properties by location, price range, property type, number of bedrooms, and more. You can also use our voice search feature for natural language queries.`
    },
    {
      question: `Are these properties verified?`,
      answer: `Yes, all properties on our platform are verified by our expert team. We ensure accurate information, photos, and pricing for every listing.`
    }
  ];
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

// Generate home page FAQ
const generateHomeFAQ = () => {
  const faqs = [
    {
      question: "How do I find properties on Inmobi?",
      answer: "Use our advanced search to filter by location, price, property type, and amenities. Browse detailed listings with photos, virtual tours, and agent contact information."
    },
    {
      question: "What types of properties do you offer?",
      answer: "We offer apartments, houses, villas, commercial properties, and vacation rentals for both sale and rent across Spain and Europe."
    },
    {
      question: "How do I contact property agents?",
      answer: "Each property listing includes agent contact information. You can call, email, or message agents directly through our platform."
    },
    {
      question: "Can I schedule property viewings?",
      answer: "Yes, you can schedule both physical and virtual property tours through our platform. Contact agents to arrange convenient viewing times."
    }
  ];
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

// Generate conversational content for LLM understanding
const generateConversationalContent = (property: Property) => {
  return {
    quickAnswers: [
      `This is a ${property.bedrooms}-bedroom ${property.propertyType} in ${property.city}`,
      `The property costs ${property.price?.toLocaleString()} EUR for ${property.listingType}`,
      `Key features include: ${property.features?.slice(0, 3).join(', ')}`,
      `Located in ${property.city}, ${property.country}`
    ],
    naturalLanguageDescription: `Looking for a ${property.propertyType} in ${property.city}? This ${property.bedrooms}-bedroom property offers ${property.bathrooms} bathrooms and ${property.squareFeet} square feet of living space. Available for ${property.listingType} at ${property.price?.toLocaleString()} EUR, this property features ${property.features?.slice(0, 3).join(', ')}. Contact our agents to schedule a viewing today.`
  };
};

const generateSearchConversationalContent = (location?: string, propertyType?: string) => {
  return {
    quickAnswers: [
      `Find ${propertyType || 'properties'} in ${location || 'Spain'}`,
      `Browse apartments, houses, and villas`,
      `Filter by price, bedrooms, and amenities`,
      `Schedule viewings with expert agents`
    ],
    naturalLanguageDescription: `Searching for ${propertyType || 'properties'} in ${location || 'Spain'}? Our platform offers comprehensive property listings with detailed photos, virtual tours, and expert agent support. Use our advanced search filters to find your perfect home today.`
  };
};

const generateHomeConversationalContent = () => {
  return {
    quickAnswers: [
      `Find properties for sale and rent across Spain`,
      `Browse detailed listings with photos and tours`,
      `Connect with verified real estate agents`,
      `Schedule property viewings online`
    ],
    naturalLanguageDescription: `Welcome to Inmobi, your premier real estate platform for finding properties across Spain and Europe. Whether you're looking to buy, rent, or invest, our comprehensive listings and expert agents help you find your dream property. Start your search today.`
  };
};

// Enhanced Organization Schema for businesses
const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Inmobi Real Estate",
    "url": "https://inmobi.mobi",
    "logo": "https://inmobi.mobi/logo.png",
    "description": "Premier real estate platform for finding properties across Spain and Europe",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ES"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+34-679-680-000",
      "contactType": "customer service",
      "areaServed": "ES",
      "availableLanguage": ["en", "es", "ca", "de", "fr"]
    },
    "sameAs": [
      "https://www.facebook.com/inmobi",
      "https://www.instagram.com/inmobi",
      "https://www.linkedin.com/company/inmobi"
    ]
  };
};

// Main component
export const EnhancedSEO: React.FC<EnhancedSEOProps> = (props) => {
  const content = generateLLMContent(props);
  
  if (!content) return null;
  
  return (
    <>
      {/* Hidden SEO content for LLMs - not using Helmet to avoid conflicts */}
      <div className="sr-only" data-enhanced-seo="true">
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        
        {/* FAQ Schema as hidden content */}
        {content.faqSchema && (
          <script type="application/ld+json" data-schema="faq">
            {JSON.stringify(content.faqSchema)}
          </script>
        )}
        
        {/* Organization Schema */}
        <script type="application/ld+json" data-schema="organization">
          {JSON.stringify(generateOrganizationSchema())}
        </script>
        
        {/* Conversational content for LLMs */}
        {content.conversationalContent && (
          <div data-conversational="true">
            <p>{content.conversationalContent.naturalLanguageDescription}</p>
            <ul>
              {content.conversationalContent.quickAnswers.map((answer, index) => (
                <li key={index}>{answer}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default EnhancedSEO;