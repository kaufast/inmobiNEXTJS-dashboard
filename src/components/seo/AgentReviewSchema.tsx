/**
 * Agent Review System with Structured Data
 * Implements agent reviews with Schema.org structured data for SEO
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Property } from '@shared/schema';

interface AgentReview {
  id: string;
  author: {
    name: string;
    avatar?: string;
    verifiedPurchase?: boolean;
    location?: string;
  };
  rating: number; // 1-5 stars
  reviewText: string;
  datePublished: string; // ISO 8601 date
  title?: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend?: boolean;
  propertyId?: string;
  agentResponse?: {
    text: string;
    datePublished: string;
  };
  helpfulVotes?: number;
  verifiedReview?: boolean;
  reviewType?: 'sale' | 'rent' | 'consultation';
  transactionValue?: number;
}

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  license?: string;
  specialties?: string[];
  experience?: number; // years
  overallRating?: number;
  totalReviews?: number;
}

interface AgentReviewSchemaProps {
  agent: Agent;
  reviews: AgentReview[];
  property?: Property;
  locale?: string;
}

export function AgentReviewSchema({ agent, reviews, property, locale = 'en-US' }: AgentReviewSchemaProps) {
  // Calculate aggregate rating
  const aggregateRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  // Create Person schema for the agent
  const agentSchema = {
    "@type": "Person",
    "@id": `https://inmobi.mobi/agent/${agent.id}`,
    "name": agent.name,
    "image": agent.avatar || "/images/default-agent-avatar.jpg",
    "jobTitle": agent.title || "Real Estate Agent",
    "worksFor": {
      "@type": "Organization",
      "name": agent.company || "Inmobi Real Estate",
      "url": "https://inmobi.mobi"
    },
    "email": agent.email,
    "telephone": agent.phone,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US" // This should be dynamic based on agent location
    },
    "knowsAbout": agent.specialties || ["Real Estate", "Property Sales", "Property Management"],
    "hasCredential": agent.license ? {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "Real Estate License",
      "recognizedBy": {
        "@type": "Organization",
        "name": "State Real Estate Commission"
      }
    } : undefined,
    "aggregateRating": reviews.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": aggregateRating.toFixed(1),
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "review": reviews.map(review => ({
      "@type": "Review",
      "@id": `https://inmobi.mobi/review/${review.id}`,
      "author": {
        "@type": "Person",
        "name": review.author.name,
        "image": review.author.avatar
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating.toString(),
        "bestRating": "5",
        "worstRating": "1"
      },
      "reviewBody": review.reviewText,
      "datePublished": review.datePublished,
      "headline": review.title,
      "publisher": {
        "@type": "Organization",
        "name": "Inmobi",
        "url": "https://inmobi.mobi"
      },
      "about": property ? {
        "@type": "RealEstateListing",
        "name": property.title,
        "url": `https://inmobi.mobi/property/${property.id}`
      } : {
        "@type": "Service",
        "name": "Real Estate Services",
        "provider": {
          "@type": "Person",
          "name": agent.name
        }
      }
    }))
  };

  // Create LocalBusiness schema if agent has company
  const businessSchema = agent.company ? {
    "@type": "LocalBusiness",
    "@id": `https://inmobi.mobi/business/${agent.company.toLowerCase().replace(/\s+/g, '-')}`,
    "name": agent.company,
    "employee": {
      "@type": "Person",
      "name": agent.name
    },
    "aggregateRating": reviews.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": aggregateRating.toFixed(1),
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined
  } : undefined;

  // Combined schema
  const reviewSchema = {
    "@context": "https://schema.org",
    "@graph": [agentSchema, businessSchema].filter(Boolean)
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(reviewSchema)}
      </script>
    </Helmet>
  );
}

// Agent Review Display Component
export function AgentReviewDisplay({ agent, reviews, property, locale = 'en-US' }: AgentReviewSchemaProps) {
  const { t } = useTranslation(['properties', 'common']);
  const [sortBy, setSortBy] = React.useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [showAll, setShowAll] = React.useState(false);

  // Calculate aggregate rating
  const aggregateRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime();
      case 'oldest':
        return new Date(a.datePublished).getTime() - new Date(b.datePublished).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const displayedReviews = showAll ? sortedReviews : sortedReviews.slice(0, 5);

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-2xl font-bold mb-4 text-gray-900">
          {t('agent.reviews.title', 'Agent Reviews')}
        </h3>
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-600">
            {t('agent.reviews.noReviews', 'No reviews yet for this agent')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          {t('agent.reviews.title', 'Agent Reviews')}
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">{t('reviews.sort.newest', 'Newest First')}</option>
          <option value="oldest">{t('reviews.sort.oldest', 'Oldest First')}</option>
          <option value="highest">{t('reviews.sort.highest', 'Highest Rating')}</option>
          <option value="lowest">{t('reviews.sort.lowest', 'Lowest Rating')}</option>
        </select>
      </div>

      {/* Aggregate Rating */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {aggregateRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              {t('reviews.outOf', 'out of 5')}
            </div>
          </div>
          <div className="flex-1">
            {renderStars(aggregateRating, 'lg')}
            <div className="text-sm text-gray-600 mt-1">
              {t('reviews.basedOn', { count: reviews.length }, `Based on ${reviews.length} reviews`)}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {displayedReviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {review.author.avatar ? (
                  <img
                    src={review.author.avatar}
                    alt={review.author.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {review.author.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      {review.author.name}
                      {review.verifiedReview && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('reviews.verified', 'Verified')}
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{new Date(review.datePublished).toLocaleDateString()}</span>
                      {review.author.location && (
                        <>
                          <span>•</span>
                          <span>{review.author.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
                
                {review.title && (
                  <h5 className="font-medium text-gray-900 mb-2">
                    {review.title}
                  </h5>
                )}
                
                <p className="text-gray-700 mb-3 leading-relaxed">
                  {review.reviewText}
                </p>
                
                {(review.pros || review.cons) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {review.pros && review.pros.length > 0 && (
                      <div>
                        <h6 className="font-medium text-green-800 mb-1">
                          {t('reviews.pros', 'Pros')}
                        </h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {review.pros.map((pro, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2">+</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {review.cons && review.cons.length > 0 && (
                      <div>
                        <h6 className="font-medium text-red-800 mb-1">
                          {t('reviews.cons', 'Cons')}
                        </h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {review.cons.map((con, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-red-500 mr-2">-</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {review.wouldRecommend !== undefined && (
                  <div className="flex items-center mb-3">
                    <span className="text-sm text-gray-600 mr-2">
                      {t('reviews.wouldRecommend', 'Would recommend:')}
                    </span>
                    <span className={`text-sm font-medium ${
                      review.wouldRecommend ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {review.wouldRecommend ? t('common.yes', 'Yes') : t('common.no', 'No')}
                    </span>
                  </div>
                )}
                
                {review.agentResponse && (
                  <div className="bg-blue-50 rounded-lg p-3 mt-3">
                    <h6 className="font-medium text-blue-900 mb-1">
                      {t('reviews.agentResponse', 'Response from')} {agent.name}
                    </h6>
                    <p className="text-sm text-blue-800">
                      {review.agentResponse.text}
                    </p>
                    <div className="text-xs text-blue-600 mt-1">
                      {new Date(review.agentResponse.datePublished).toLocaleDateString()}
                    </div>
                  </div>
                )}
                
                {review.helpfulVotes && review.helpfulVotes > 0 && (
                  <div className="flex items-center mt-3 text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {t('reviews.helpfulVotes', { count: review.helpfulVotes }, `${review.helpfulVotes} found this helpful`)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {reviews.length > 5 && !showAll && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {t('reviews.showMore', `Show ${reviews.length - 5} more reviews`)}
          </button>
        </div>
      )}
    </div>
  );
}

// Sample review data generator
export function generateSampleReviews(agent: Agent): AgentReview[] {
  const sampleReviews: AgentReview[] = [
    {
      id: "1",
      author: {
        name: "Sarah Johnson",
        avatar: "/images/avatars/sarah.jpg",
        verifiedPurchase: true,
        location: "Barcelona, Spain"
      },
      rating: 5,
      reviewText: "Excellent service from start to finish. Very professional and knowledgeable about the local market. Made the entire process smooth and stress-free.",
      datePublished: "2024-01-15T10:30:00Z",
      title: "Outstanding Real Estate Agent",
      pros: ["Very responsive", "Expert knowledge", "Professional service"],
      wouldRecommend: true,
      verifiedReview: true,
      reviewType: "sale",
      helpfulVotes: 12
    },
    {
      id: "2",
      author: {
        name: "Michael Chen",
        location: "Madrid, Spain"
      },
      rating: 4,
      reviewText: "Great agent who really understood our needs. Found us the perfect apartment within our budget. Only minor issue was some delays in communication.",
      datePublished: "2024-01-10T14:20:00Z",
      title: "Very helpful and understanding",
      pros: ["Good listener", "Found great options", "Budget-conscious"],
      cons: ["Occasional delays in response"],
      wouldRecommend: true,
      verifiedReview: true,
      reviewType: "rent",
      helpfulVotes: 8
    },
    {
      id: "3",
      author: {
        name: "Emma Rodriguez",
        location: "Valencia, Spain"
      },
      rating: 5,
      reviewText: "Incredible experience! This agent went above and beyond to help us find our dream home. Highly recommend to anyone looking for properties in the area.",
      datePublished: "2024-01-05T09:15:00Z",
      title: "Dream home found!",
      pros: ["Went above and beyond", "Found dream home", "Excellent communication"],
      wouldRecommend: true,
      verifiedReview: true,
      reviewType: "sale",
      helpfulVotes: 15,
      agentResponse: {
        text: "Thank you Emma! It was my pleasure helping you find your perfect home. Wishing you all the best in your new place!",
        datePublished: "2024-01-06T11:30:00Z"
      }
    }
  ];

  return sampleReviews;
}

// Hook for managing agent reviews
export function useAgentReviews(agentId: string) {
  const [reviews, setReviews] = React.useState<AgentReview[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        // In a real app, this would fetch from API
        // For demo purposes, we'll use sample data
        const sampleAgent = {
          id: agentId,
          name: "Areeya al Shams",
          title: "Senior Real Estate Agent",
          company: "Inmobi Real Estate"
        };
        
        const sampleReviews = generateSampleReviews(sampleAgent);
        setReviews(sampleReviews);
      } catch (error) {
        console.error('Error fetching agent reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [agentId]);

  const addReview = (review: AgentReview) => {
    setReviews(prev => [review, ...prev]);
  };

  const updateReview = (reviewId: string, updates: Partial<AgentReview>) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { ...review, ...updates } : review
    ));
  };

  return {
    reviews,
    loading,
    addReview,
    updateReview
  };
}

export default AgentReviewSchema;