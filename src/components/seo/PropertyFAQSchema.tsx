/**
 * Property FAQ Schema Component
 * Implements FAQ structured data specifically for real estate properties
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Property } from '@shared/schema';

interface PropertyFAQItem {
  question: string;
  answer: string;
  category?: 'property' | 'location' | 'financing' | 'process' | 'general';
}

interface PropertyFAQSchemaProps {
  property: Property;
  customFAQs?: PropertyFAQItem[];
  locale?: string;
}

export function PropertyFAQSchema({ property, customFAQs = [], locale = 'en-US' }: PropertyFAQSchemaProps) {
  const { t } = useTranslation(['properties', 'common']);

  // Generate common property FAQs based on property data
  const generatePropertyFAQs = (property: Property): PropertyFAQItem[] => {
    const faqs: PropertyFAQItem[] = [];

    // Property details FAQ
    faqs.push({
      question: t('faq.property.details.question', { 
        title: property.title,
        default: `What are the details of ${property.title}?`
      }),
      answer: t('faq.property.details.answer', {
        title: property.title,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: property.squareFeet,
        type: property.propertyType,
        price: property.price,
        default: `${property.title} is a ${property.propertyType} with ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms, spanning ${property.squareFeet} square feet. It's priced at $${property.price?.toLocaleString()}.`
      }),
      category: 'property'
    });

    // Location FAQ
    if (property.city && property.country) {
      faqs.push({
        question: t('faq.location.question', {
          city: property.city,
          default: `Where is this property located in ${property.city}?`
        }),
        answer: t('faq.location.answer', {
          address: property.address,
          city: property.city,
          country: property.country,
          default: `This property is located at ${property.address}, ${property.city}, ${property.country}. It's in a prime location with easy access to local amenities.`
        }),
        category: 'location'
      });
    }

    // Price FAQ
    if (property.price) {
      faqs.push({
        question: t('faq.price.question', {
          default: `What is the price of this property?`
        }),
        answer: t('faq.price.answer', {
          price: property.price,
          type: property.listingType,
          default: `This property is priced at $${property.price.toLocaleString()} for ${property.listingType}. Contact us for more details about pricing and availability.`
        }),
        category: 'financing'
      });
    }

    // Features FAQ
    if (property.features && property.features.length > 0) {
      faqs.push({
        question: t('faq.features.question', {
          default: `What features does this property have?`
        }),
        answer: t('faq.features.answer', {
          features: property.features.join(', '),
          default: `This property includes the following features: ${property.features.join(', ')}. These amenities enhance the living experience and property value.`
        }),
        category: 'property'
      });
    }

    // Neighborhood FAQ
    if (property.city) {
      faqs.push({
        question: t('faq.neighborhood.question', {
          city: property.city,
          default: `What's the neighborhood like in ${property.city}?`
        }),
        answer: t('faq.neighborhood.answer', {
          city: property.city,
          country: property.country,
          default: `The neighborhood in ${property.city}, ${property.country} offers excellent amenities including schools, shopping, restaurants, and transportation links. It's a desirable area for both living and investment.`
        }),
        category: 'location'
      });
    }

    // Process FAQ
    faqs.push({
      question: t('faq.process.viewing.question', {
        default: `How can I schedule a viewing of this property?`
      }),
      answer: t('faq.process.viewing.answer', {
        default: `You can schedule a viewing by contacting us through the property listing. We offer both in-person and virtual tours to accommodate your needs. Our agents are available to answer any questions during the viewing.`
      }),
      category: 'process'
    });

    // Investment FAQ for sale properties
    if (property.listingType === 'sale') {
      faqs.push({
        question: t('faq.investment.question', {
          default: `Is this property a good investment?`
        }),
        answer: t('faq.investment.answer', {
          city: property.city,
          type: property.propertyType,
          default: `This ${property.propertyType} in ${property.city} represents a solid investment opportunity. The area has shown consistent growth, and the property features make it attractive for both rental income and long-term appreciation.`
        }),
        category: 'financing'
      });
    }

    // Rental FAQ for rent properties
    if (property.listingType === 'rent') {
      faqs.push({
        question: t('faq.rental.terms.question', {
          default: `What are the rental terms for this property?`
        }),
        answer: t('faq.rental.terms.answer', {
          price: property.price,
          default: `This property is available for rent at $${property.price?.toLocaleString()} per month. Rental terms include standard lease agreements, and we can discuss flexible arrangements based on your needs.`
        }),
        category: 'process'
      });
    }

    return faqs;
  };

  // Combine generated and custom FAQs
  const allFAQs = [...generatePropertyFAQs(property), ...customFAQs];

  // Create FAQ structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allFAQs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
}

// Property FAQ Display Component
export function PropertyFAQDisplay({ property, locale = 'en-US' }: PropertyFAQSchemaProps) {
  const { t } = useTranslation(['properties', 'common']);
  const [expandedFAQ, setExpandedFAQ] = React.useState<number | null>(null);

  const faqs = [
    {
      question: t('faq.property.details.question', { 
        title: property.title,
        default: `What are the details of ${property.title}?`
      }),
      answer: t('faq.property.details.answer', {
        title: property.title,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: property.squareFeet,
        type: property.propertyType,
        price: property.price,
        default: `${property.title} is a ${property.propertyType} with ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms, spanning ${property.squareFeet} square feet. It's priced at $${property.price?.toLocaleString()}.`
      })
    },
    {
      question: t('faq.location.question', {
        city: property.city,
        default: `Where is this property located in ${property.city}?`
      }),
      answer: t('faq.location.answer', {
        address: property.address,
        city: property.city,
        country: property.country,
        default: `This property is located at ${property.address}, ${property.city}, ${property.country}. It's in a prime location with easy access to local amenities.`
      })
    },
    {
      question: t('faq.price.question', {
        default: `What is the price of this property?`
      }),
      answer: t('faq.price.answer', {
        price: property.price,
        type: property.listingType,
        default: `This property is priced at $${property.price?.toLocaleString()} for ${property.listingType}. Contact us for more details about pricing and availability.`
      })
    },
    {
      question: t('faq.process.viewing.question', {
        default: `How can I schedule a viewing of this property?`
      }),
      answer: t('faq.process.viewing.answer', {
        default: `You can schedule a viewing by contacting us through the property listing. We offer both in-person and virtual tours to accommodate your needs.`
      })
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">
        {t('propertyDetails.faq.title', 'Frequently Asked Questions')}
      </h3>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex justify-between items-center"
            >
              <span className="font-medium text-gray-900 pr-4">
                {faq.question}
              </span>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                  expandedFAQ === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            
            {expandedFAQ === index && (
              <div className="px-6 py-4 bg-white border-t border-gray-200">
                <p className="text-gray-700 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Common real estate FAQs for different property types
export const COMMON_REAL_ESTATE_FAQS = {
  apartment: [
    {
      question: "What utilities are included in the rent?",
      answer: "Utilities typically include water, heating, and basic maintenance. Electricity and internet may be separate. Please check with the property manager for specific details.",
      category: 'process' as const
    },
    {
      question: "Is parking included with this apartment?",
      answer: "Parking availability varies by property. Some include designated parking spaces, while others may charge separately. Contact us for specific parking arrangements.",
      category: 'property' as const
    }
  ],
  house: [
    {
      question: "What is the maintenance responsibility for this house?",
      answer: "For rental properties, major maintenance is typically handled by the landlord, while tenants are responsible for basic upkeep. For purchases, all maintenance becomes the owner's responsibility.",
      category: 'process' as const
    },
    {
      question: "Are pets allowed in this house?",
      answer: "Pet policies vary by property and landlord. Some properties are pet-friendly with additional deposits, while others have restrictions. Please inquire about specific pet policies.",
      category: 'process' as const
    }
  ],
  condo: [
    {
      question: "What are the HOA fees for this condo?",
      answer: "HOA fees vary by building and typically cover common area maintenance, amenities, and building services. Contact us for specific HOA fee information for this property.",
      category: 'financing' as const
    },
    {
      question: "What amenities are available in this condo building?",
      answer: "Condo amenities may include fitness centers, pools, concierge services, and common areas. Specific amenities depend on the building and are detailed in the property listing.",
      category: 'property' as const
    }
  ]
};

// Hook for managing property FAQs
export function usePropertyFAQs(property: Property) {
  const [customFAQs, setCustomFAQs] = React.useState<PropertyFAQItem[]>([]);

  const addCustomFAQ = (faq: PropertyFAQItem) => {
    setCustomFAQs(prev => [...prev, faq]);
  };

  const removeCustomFAQ = (index: number) => {
    setCustomFAQs(prev => prev.filter((_, i) => i !== index));
  };

  // Get common FAQs for property type
  const getCommonFAQs = () => {
    const propertyType = property.propertyType as keyof typeof COMMON_REAL_ESTATE_FAQS;
    return COMMON_REAL_ESTATE_FAQS[propertyType] || [];
  };

  return {
    customFAQs,
    addCustomFAQ,
    removeCustomFAQ,
    getCommonFAQs
  };
}

export default PropertyFAQSchema;