import React from 'react';
import { Property } from '@shared/schema';

interface MachineReadableDataProps {
  property?: Property;
  properties?: Property[];
  context: 'property' | 'search' | 'home';
}

export const MachineReadableData: React.FC<MachineReadableDataProps> = ({
  property,
  properties = [],
  context
}) => {
  
  // Generate machine-readable property data
  const generatePropertyData = (prop: Property) => {
    return {
      id: prop.id,
      title: prop.title,
      description: prop.description,
      price: prop.price,
      currency: 'EUR',
      propertyType: prop.propertyType,
      listingType: prop.listingType,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      area: {
        value: prop.areaSqm || prop.squareFeet,
        unit: prop.areaSqm ? 'sqm' : 'sqft'
      },
      location: {
        address: prop.address,
        city: prop.city,
        state: prop.state,
        country: prop.country,
        coordinates: prop.latitude && prop.longitude ? {
          lat: prop.latitude,
          lng: prop.longitude
        } : null
      },
      features: prop.features || [],
      images: prop.images || [],
      isVerified: prop.isVerified || false,
      createdAt: prop.createdAt,
      updatedAt: prop.updatedAt,
      url: `https://inmobi.mobi/property/${prop.id}`,
      agent: {
        name: 'Areeya al Shams',
        email: 'areeya@inmobi.mobi',
        phone: '+34-679-680-000'
      }
    };
  };

  // Generate search context data
  const generateSearchData = (props: Property[]) => {
    return {
      totalResults: props.length,
      properties: props.map(generatePropertyData),
      searchContext: context,
      timestamp: new Date().toISOString(),
      platform: 'Inmobi Real Estate'
    };
  };

  return (
    <div className="sr-only" data-machine-readable="true">
      {/* Property-specific data */}
      {context === 'property' && property && (
        <div 
          data-property-data={JSON.stringify(generatePropertyData(property))}
          data-context="property-details"
        >
          {/* Structured property information for LLMs */}
          <h1>Property Information</h1>
          <dl>
            <dt>Property ID</dt>
            <dd>{property.id}</dd>
            
            <dt>Title</dt>
            <dd>{property.title}</dd>
            
            <dt>Description</dt>
            <dd>{property.description}</dd>
            
            <dt>Price</dt>
            <dd>{property.price} EUR</dd>
            
            <dt>Property Type</dt>
            <dd>{property.propertyType}</dd>
            
            <dt>Listing Type</dt>
            <dd>{property.listingType}</dd>
            
            <dt>Bedrooms</dt>
            <dd>{property.bedrooms}</dd>
            
            <dt>Bathrooms</dt>
            <dd>{property.bathrooms}</dd>
            
            <dt>Area</dt>
            <dd>{property.areaSqm || property.squareFeet} {property.areaSqm ? 'sqm' : 'sqft'}</dd>
            
            <dt>Location</dt>
            <dd>{property.address}, {property.city}, {property.state}, {property.country}</dd>
            
            <dt>Features</dt>
            <dd>{property.features?.join(', ')}</dd>
            
            <dt>Verification Status</dt>
            <dd>{property.isVerified ? 'Verified' : 'Pending'}</dd>
          </dl>
          
          {/* Natural language summary for LLMs */}
          <p data-summary="true">
            This is a {property.bedrooms}-bedroom {property.propertyType} located in {property.city}, {property.country}. 
            The property is available for {property.listingType} at {property.price?.toLocaleString()} EUR. 
            It features {property.bathrooms} bathrooms and {property.areaSqm || property.squareFeet} square {property.areaSqm ? 'meters' : 'feet'} of living space.
            {property.features && property.features.length > 0 && ` Key amenities include ${property.features.slice(0, 5).join(', ')}.`}
            {property.isVerified && ' This property has been verified by our team.'}
          </p>
        </div>
      )}

      {/* Search results data */}
      {context === 'search' && properties.length > 0 && (
        <div 
          data-search-results={JSON.stringify(generateSearchData(properties))}
          data-context="search-results"
        >
          <h1>Search Results</h1>
          <p data-results-summary="true">
            Found {properties.length} properties matching your search criteria. 
            Results include various property types across different locations with verified listings and detailed information.
          </p>
          
          {/* Individual property summaries */}
          {properties.slice(0, 10).map((prop, index) => (
            <div key={prop.id} data-property-summary={index + 1}>
              <h2>{prop.title}</h2>
              <p>
                {prop.propertyType} in {prop.city} - {prop.bedrooms} bed, {prop.bathrooms} bath - {prop.price?.toLocaleString()} EUR
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Home page data */}
      {context === 'home' && (
        <div data-context="home-page">
          <h1>Real Estate Platform Information</h1>
          <dl>
            <dt>Platform Name</dt>
            <dd>Inmobi Real Estate</dd>
            
            <dt>Service Type</dt>
            <dd>Real Estate Search and Listing Platform</dd>
            
            <dt>Coverage Area</dt>
            <dd>Spain and Europe</dd>
            
            <dt>Services Offered</dt>
            <dd>Property Search, Property Listings, Virtual Tours, Agent Connections, Market Analysis</dd>
            
            <dt>Property Types</dt>
            <dd>Apartments, Houses, Villas, Commercial Properties, Vacation Rentals</dd>
            
            <dt>Transaction Types</dt>
            <dd>Sales, Rentals, Investments</dd>
            
            <dt>Contact Information</dt>
            <dd>+34-679-680-000, info@inmobi.mobi</dd>
          </dl>
          
          <p data-platform-summary="true">
            Inmobi is a comprehensive real estate platform that connects buyers, sellers, and renters with verified properties across Spain and Europe. 
            We offer advanced search capabilities, virtual tours, expert agent connections, and detailed property information to help users find their perfect property.
          </p>
        </div>
      )}

      {/* Metadata for search engines and LLMs */}
      <div data-metadata="true">
        <div data-last-updated={new Date().toISOString()}></div>
        <div data-content-type="real-estate"></div>
        <div data-language="multiple" data-supported-languages="en,es,ca,de,fr"></div>
        <div data-verification-status="platform-verified"></div>
        <div data-api-version="2024.1"></div>
      </div>

      {/* Quick facts for voice assistants */}
      <div data-quick-facts="true">
        {property && (
          <ul>
            <li>Property price: {property.price?.toLocaleString()} EUR</li>
            <li>Property type: {property.propertyType}</li>
            <li>Location: {property.city}, {property.country}</li>
            <li>Bedrooms: {property.bedrooms}</li>
            <li>Bathrooms: {property.bathrooms}</li>
            <li>Available for: {property.listingType}</li>
          </ul>
        )}
        
        {properties.length > 0 && (
          <ul>
            <li>Total properties found: {properties.length}</li>
            <li>Property types available: {[...new Set(properties.map(p => p.propertyType))].join(', ')}</li>
            <li>Locations covered: {[...new Set(properties.map(p => p.city))].slice(0, 5).join(', ')}</li>
            <li>Price range: {Math.min(...properties.map(p => p.price || 0)).toLocaleString()} - {Math.max(...properties.map(p => p.price || 0)).toLocaleString()} EUR</li>
          </ul>
        )}
      </div>

      {/* Conversational hints for LLMs */}
      <div data-conversational-hints="true">
        <p>
          This page contains real estate information. Users may ask about property details, pricing, locations, amenities, viewing schedules, 
          agent contacts, and market information. The platform serves Spain and Europe with verified listings and expert support.
        </p>
      </div>
    </div>
  );
};

export default MachineReadableData;