import React from 'react';
import { Property } from '@shared/schema';

interface VoiceSearchOptimizationProps {
  property?: Property;
  context?: 'property' | 'search' | 'home';
  location?: string;
  propertyType?: string;
}

export const VoiceSearchOptimization: React.FC<VoiceSearchOptimizationProps> = ({
  property,
  context = 'home',
  location,
  propertyType
}) => {
  
  // Generate voice search optimized content
  const generateVoiceContent = () => {
    switch (context) {
      case 'property':
        return property ? generatePropertyVoiceContent(property) : null;
      case 'search':
        return generateSearchVoiceContent(location, propertyType);
      case 'home':
        return generateHomeVoiceContent();
      default:
        return null;
    }
  };

  // Property-specific voice search content
  const generatePropertyVoiceContent = (prop: Property) => {
    const questions = [
      `How much does this ${prop.propertyType} in ${prop.city} cost?`,
      `What amenities does this property have?`,
      `How many bedrooms does this property have?`,
      `Where is this property located?`,
      `Can I schedule a viewing for this property?`,
      `What's included with this property?`,
      `Is this property available for ${prop.listingType}?`,
      `How big is this property?`
    ];

    const answers = [
      `This ${prop.propertyType} in ${prop.city} costs ${prop.price?.toLocaleString()} euros for ${prop.listingType}.`,
      `This property includes ${prop.features?.slice(0, 5).join(', ')} and other modern amenities.`,
      `This property has ${prop.bedrooms} bedrooms and ${prop.bathrooms} bathrooms.`,
      `This property is located in ${prop.city}, ${prop.country} at ${prop.address}.`,
      `Yes, you can schedule both physical and virtual viewings through our platform or by contacting our agents.`,
      `The property includes all listed amenities and features. Contact our agents for complete details.`,
      `Yes, this property is available for ${prop.listingType} at the listed price.`,
      `This property is ${prop.areaSqm || prop.squareFeet} square ${prop.areaSqm ? 'meters' : 'feet'}.`
    ];

    return { questions, answers };
  };

  // Search-specific voice content
  const generateSearchVoiceContent = (loc?: string, propType?: string) => {
    const questions = [
      `What ${propType || 'properties'} are available in ${loc || 'Spain'}?`,
      `How do I find properties in ${loc || 'this area'}?`,
      `What's the average price for ${propType || 'properties'} in ${loc || 'Spain'}?`,
      `Can I filter properties by price range?`,
      `How do I contact property agents?`,
      `Are these properties verified?`,
      `Can I schedule property viewings?`,
      `What areas do you cover?`
    ];

    const answers = [
      `We have a comprehensive selection of ${propType || 'properties'} in ${loc || 'Spain'} with updated listings and detailed information.`,
      `Use our search filters to find properties by location, price, type, and amenities. You can also browse our interactive map.`,
      `Property prices vary by location and type. Use our filters to see current market prices in your preferred area.`,
      `Yes, you can filter by price range, bedrooms, bathrooms, property type, and many other criteria.`,
      `Each property listing includes agent contact information. You can call, email, or message through our platform.`,
      `Yes, all properties are verified by our expert team for accuracy and authenticity.`,
      `Yes, you can schedule both physical and virtual viewings through our platform.`,
      `We cover major cities and regions across Spain and Europe with local expert agents.`
    ];

    return { questions, answers };
  };

  // Home page voice content
  const generateHomeVoiceContent = () => {
    const questions = [
      'What is Inmobi?',
      'How do I search for properties?',
      'What services do you offer?',
      'What areas do you cover?',
      'How much do your services cost?',
      'How do I contact an agent?',
      'Can I list my property?',
      'Do you offer virtual tours?'
    ];

    const answers = [
      'Inmobi is a premier real estate platform connecting buyers, sellers, and renters with verified properties across Spain and Europe.',
      'Use our advanced search filters to find properties by location, price, type, and amenities. Browse detailed listings with photos and virtual tours.',
      'We offer comprehensive real estate services including property search, virtual tours, agent connections, market analysis, and financing assistance.',
      'We cover major cities and regions across Spain and Europe including Madrid, Barcelona, Valencia, Seville, and many other locations.',
      'Our platform is free for property seekers. You can search, view listings, and contact agents at no cost.',
      'Each property includes agent contact information, or you can use our general contact form to connect with our team.',
      'Yes, property owners and agents can list properties on our platform. Contact us for listing information.',
      'Yes, many of our properties offer virtual tours and 360-degree views for remote viewing convenience.'
    ];

    return { questions, answers };
  };

  const voiceContent = generateVoiceContent();

  if (!voiceContent) return null;

  // Generate Speakable schema for voice search
  const generateSpeakableSchema = () => {
    if (!voiceContent) return null;

    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [".voice-optimized-content", ".faq-content", ".property-summary"]
      }
    };
  };

  return (
    <>

      {/* Hidden voice-optimized content for search engines */}
      <div className="sr-only voice-optimized-content">
        <h2>Frequently Asked Questions</h2>
        {voiceContent.questions.map((question, index) => (
          <div key={index}>
            <h3>{question}</h3>
            <p>{voiceContent.answers[index]}</p>
          </div>
        ))}
      </div>

      {/* Structured data for question-answering */}
      <div className="sr-only">
        <div itemScope itemType="https://schema.org/FAQPage">
          {voiceContent.questions.map((question, index) => (
            <div key={index} itemScope itemType="https://schema.org/Question" itemProp="mainEntity">
              <h4 itemProp="name">{question}</h4>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <div itemProp="text">{voiceContent.answers[index]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Natural language hints for LLMs */}
      <div className="sr-only">
        <p>
          This page provides information about real estate properties and services. 
          Users can ask questions about properties, pricing, locations, amenities, and viewing schedules.
          Our platform serves buyers, sellers, and renters across Spain and Europe with verified listings and expert agents.
        </p>
      </div>
    </>
  );
};

export default VoiceSearchOptimization;