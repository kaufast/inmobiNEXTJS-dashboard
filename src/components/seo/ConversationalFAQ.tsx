import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, Search, Home, MapPin } from 'lucide-react';
import { Property } from '@shared/schema';
import { useTranslation } from 'react-i18next';

interface ConversationalFAQProps {
  property?: Property;
  location?: string;
  propertyType?: string;
  context?: 'property' | 'search' | 'home' | 'agent';
  className?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  icon: React.ReactNode;
}

export const ConversationalFAQ: React.FC<ConversationalFAQProps> = ({
  property,
  location,
  propertyType,
  context = 'home',
  className = ''
}) => {
  const { t } = useTranslation();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate context-specific FAQs
  const generateFAQs = (): FAQItem[] => {
    switch (context) {
      case 'property':
        return property ? generatePropertyFAQs(property) : [];
      case 'search':
        return generateSearchFAQs(location, propertyType);
      case 'home':
        return generateHomeFAQs();
      case 'agent':
        return generateAgentFAQs();
      default:
        return [];
    }
  };

  const generatePropertyFAQs = (prop: Property): FAQItem[] => [
    {
      id: 'prop-overview',
      question: `What can you tell me about this ${prop.propertyType} in ${prop.city}?`,
      answer: `This ${prop.propertyType} in ${prop.city} offers ${prop.bedrooms} bedrooms and ${prop.bathrooms} bathrooms across ${prop.squareFeet} square feet. ${prop.description ? prop.description.slice(0, 200) + '...' : 'This property features modern amenities and is located in a desirable area.'} The property is available for ${prop.listingType} at ${prop.price?.toLocaleString()} EUR.`,
      category: 'Overview',
      keywords: ['overview', 'details', 'about', 'what', 'tell me'],
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 'prop-price',
      question: `How much does this property cost?`,
      answer: `This property is priced at ${prop.price?.toLocaleString()} EUR for ${prop.listingType}. The price includes ${prop.features?.slice(0, 3).join(', ')} and other amenities. Contact our agents for detailed pricing information, financing options, and to schedule a viewing.`,
      category: 'Pricing',
      keywords: ['price', 'cost', 'how much', 'expensive', 'budget'],
      icon: <MessageCircle className="w-5 h-5" />
    },
    {
      id: 'prop-features',
      question: `What features and amenities are included?`,
      answer: `This property includes: ${prop.features?.join(', ') || 'Modern amenities and finishes'}. Additional features may include parking, storage, and communal areas. Contact us for a complete list of amenities and to arrange a detailed viewing.`,
      category: 'Features',
      keywords: ['features', 'amenities', 'included', 'what comes with', 'facilities'],
      icon: <Search className="w-5 h-5" />
    },
    {
      id: 'prop-location',
      question: `What's the neighborhood like in ${prop.city}?`,
      answer: `${prop.city} is known for its ${prop.city === 'Madrid' ? 'vibrant culture and excellent transport links' : prop.city === 'Barcelona' ? 'Mediterranean lifestyle and architectural beauty' : 'unique character and local amenities'}. The area offers restaurants, shops, schools, and transport connections. Our local agents can provide detailed neighborhood insights.`,
      category: 'Location',
      keywords: ['neighborhood', 'area', 'location', 'surroundings', 'nearby'],
      icon: <MapPin className="w-5 h-5" />
    },
    {
      id: 'prop-viewing',
      question: `How can I schedule a viewing?`,
      answer: `You can schedule both physical and virtual viewings through our platform. Contact our expert agents directly, use our online booking system, or call our office. We offer flexible viewing times including evenings and weekends to accommodate your schedule.`,
      category: 'Viewing',
      keywords: ['viewing', 'visit', 'see', 'schedule', 'appointment'],
      icon: <MessageCircle className="w-5 h-5" />
    },
    {
      id: 'prop-process',
      question: `What's the buying/renting process like?`,
      answer: `Our ${prop.listingType} process is straightforward: 1) Schedule a viewing, 2) Submit an application/offer, 3) Complete documentation, 4) Finalize the transaction. Our agents guide you through each step and can recommend trusted lawyers, mortgage brokers, and other professionals.`,
      category: 'Process',
      keywords: ['process', 'steps', 'how to', 'procedure', 'next steps'],
      icon: <Search className="w-5 h-5" />
    }
  ];

  const generateSearchFAQs = (loc?: string, propType?: string): FAQItem[] => [
    {
      id: 'search-available',
      question: `What ${propType || 'properties'} are available in ${loc || 'Spain'}?`,
      answer: `We have a comprehensive selection of ${propType || 'properties'} in ${loc || 'Spain'} including apartments, houses, villas, and commercial properties. Our listings are updated daily and include detailed photos, virtual tours, and accurate pricing information.`,
      category: 'Availability',
      keywords: ['available', 'what', 'types', 'selection', 'options'],
      icon: <Search className="w-5 h-5" />
    },
    {
      id: 'search-how',
      question: `How do I search for properties effectively?`,
      answer: `Use our advanced search filters to narrow down options by location, price range, property type, number of bedrooms, and specific amenities. You can also use our voice search feature for natural language queries like "3-bedroom apartment in Barcelona under 500k".`,
      category: 'Search Tips',
      keywords: ['how to search', 'find', 'filter', 'tips', 'effective'],
      icon: <Search className="w-5 h-5" />
    },
    {
      id: 'search-verified',
      question: `Are the properties on your platform verified?`,
      answer: `Yes, all properties are verified by our expert team. We conduct physical inspections, verify ownership, confirm pricing, and ensure all photos and descriptions are accurate. This gives you confidence in every listing you view.`,
      category: 'Verification',
      keywords: ['verified', 'authentic', 'real', 'legitimate', 'trust'],
      icon: <MessageCircle className="w-5 h-5" />
    },
    {
      id: 'search-agents',
      question: `How do I contact property agents?`,
      answer: `Each property listing includes direct contact information for the responsible agent. You can call, email, or message agents through our platform. Our agents are local experts who can provide additional insights and arrange viewings.`,
      category: 'Contact',
      keywords: ['contact', 'agent', 'reach', 'speak', 'call'],
      icon: <MessageCircle className="w-5 h-5" />
    }
  ];

  const generateHomeFAQs = (): FAQItem[] => [
    {
      id: 'home-start',
      question: 'How do I get started finding a property?',
      answer: 'Start by using our search filters to specify your preferences: location, budget, property type, and must-have features. Browse our listings, save favorites, and contact agents for properties that interest you. Our platform makes it easy to compare options and schedule viewings.',
      category: 'Getting Started',
      keywords: ['start', 'begin', 'how to', 'first steps', 'getting started'],
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 'home-services',
      question: 'What services do you offer?',
      answer: 'We offer comprehensive real estate services including property search, virtual tours, agent connections, market analysis, financing assistance, legal support recommendations, and ongoing customer support throughout your property journey.',
      category: 'Services',
      keywords: ['services', 'what do you offer', 'help', 'support', 'assistance'],
      icon: <MessageCircle className="w-5 h-5" />
    },
    {
      id: 'home-coverage',
      question: 'What areas do you cover?',
      answer: 'We cover major cities and regions across Spain and Europe, including Madrid, Barcelona, Valencia, Seville, Málaga, and many other locations. Our network of local agents provides expertise in each market.',
      category: 'Coverage',
      keywords: ['areas', 'locations', 'coverage', 'where', 'cities'],
      icon: <MapPin className="w-5 h-5" />
    },
    {
      id: 'home-cost',
      question: 'What are your fees?',
      answer: 'Our platform is free for property seekers. You can search, view listings, and contact agents at no cost. Agents pay a commission only when transactions are completed, ensuring their interests are aligned with helping you find the right property.',
      category: 'Fees',
      keywords: ['fees', 'cost', 'price', 'commission', 'free'],
      icon: <MessageCircle className="w-5 h-5" />
    }
  ];

  const generateAgentFAQs = (): FAQItem[] => [
    {
      id: 'agent-expert',
      question: 'Why should I work with your agents?',
      answer: 'Our agents are local market experts with extensive knowledge of neighborhoods, pricing trends, and property values. They provide personalized service, handle negotiations, and guide you through the entire process from search to closing.',
      category: 'Expertise',
      keywords: ['why', 'expert', 'agent', 'professional', 'experience'],
      icon: <MessageCircle className="w-5 h-5" />
    },
    {
      id: 'agent-contact',
      question: 'How quickly do agents respond?',
      answer: 'Our agents typically respond within 2-4 hours during business hours and within 24 hours on weekends. For urgent inquiries, many agents provide direct phone numbers for immediate assistance.',
      category: 'Response Time',
      keywords: ['response', 'quick', 'fast', 'how long', 'time'],
      icon: <MessageCircle className="w-5 h-5" />
    }
  ];

  const faqs = generateFAQs();
  
  // Filter FAQs based on search query
  const filteredFAQs = faqs.filter(faq => 
    searchQuery === '' || 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleExpanded = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          Frequently Asked Questions
        </h2>
        
        {/* Search FAQ */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredFAQs.map((faq) => (
          <div key={faq.id} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleExpanded(faq.id)}
              className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {faq.icon}
                <div>
                  <h3 className="font-medium text-gray-900">{faq.question}</h3>
                  <span className="text-sm text-gray-500">{faq.category}</span>
                </div>
              </div>
              {expandedItem === faq.id ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedItem === faq.id && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredFAQs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No questions match your search. Try different keywords or browse all questions.
        </div>
      )}

      {/* Hidden content for search engines */}
      <div className="sr-only">
        <h3>Common Questions About Real Estate</h3>
        {faqs.map((faq) => (
          <div key={`seo-${faq.id}`}>
            <h4>{faq.question}</h4>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationalFAQ;