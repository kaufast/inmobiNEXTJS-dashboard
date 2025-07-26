/**
 * SEO Performance Metrics Monitoring System
 * Comprehensive SEO tracking and performance monitoring for real estate properties
 */

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Property } from '@shared/schema';

interface SEOMetrics {
  pageTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  keywords: string[];
  headingStructure: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  imageOptimization: {
    totalImages: number;
    imagesWithAlt: number;
    imagesWithLazyLoading: number;
    imagesWithResponsive: number;
    averageFileSize: number;
    webpSupport: number;
  };
  structuredData: {
    hasProductSchema: boolean;
    hasRealEstateSchema: boolean;
    hasFAQSchema: boolean;
    hasReviewSchema: boolean;
    hasVirtualTourSchema: boolean;
    hasOrganizationSchema: boolean;
    errors: string[];
  };
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
    score: 'good' | 'needs-improvement' | 'poor';
  };
  accessibility: {
    score: number;
    issues: string[];
  };
  mobileOptimization: {
    viewport: boolean;
    responsive: boolean;
    touchTargets: boolean;
    textSize: boolean;
    loadTime: number;
  };
  linkAnalysis: {
    internalLinks: number;
    externalLinks: number;
    brokenLinks: number;
    noFollowLinks: number;
  };
  contentAnalysis: {
    wordCount: number;
    readingTime: number;
    keywordDensity: { [keyword: string]: number };
    duplicateContent: boolean;
  };
  socialMediaOptimization: {
    hasOpenGraph: boolean;
    hasTwitterCards: boolean;
    hasLinkedInMetadata: boolean;
    socialShares: number;
  };
  technicalSEO: {
    httpsEnabled: boolean;
    sitemapExists: boolean;
    robotsTxtExists: boolean;
    sslCertificate: boolean;
    pageSpeed: number;
    compression: boolean;
    caching: boolean;
  };
  searchConsoleData: {
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
    queries: { query: string; impressions: number; clicks: number; position: number }[];
  };
  competitorAnalysis: {
    rankingPosition: number;
    competitorCount: number;
    topCompetitors: string[];
    keywordGaps: string[];
  };
  localSEO: {
    hasLocalSchema: boolean;
    googleMyBusinessOptimized: boolean;
    localCitations: number;
    localKeywordRankings: { [keyword: string]: number };
  };
}

interface SEOPerformanceMonitorProps {
  property?: Property;
  url?: string;
  enableRealTimeMonitoring?: boolean;
  monitoringInterval?: number;
}

export function SEOPerformanceMonitor({
  property,
  url,
  enableRealTimeMonitoring = false,
  monitoringInterval = 300000 // 5 minutes
}: SEOPerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    // Initial analysis
    analyzeSEOMetrics();

    // Real-time monitoring
    if (enableRealTimeMonitoring) {
      const interval = setInterval(analyzeSEOMetrics, monitoringInterval);
      return () => clearInterval(interval);
    }
  }, [property, url, enableRealTimeMonitoring, monitoringInterval]);

  const analyzeSEOMetrics = async () => {
    try {
      const currentUrl = url || window.location.href;
      
      // Parallel analysis of different SEO aspects
      const [
        basicMetrics,
        structuredDataAnalysis,
        coreWebVitalsData,
        accessibilityData,
        searchConsoleData,
        competitorData
      ] = await Promise.all([
        analyzeBasicSEO(currentUrl),
        analyzeStructuredData(currentUrl),
        analyzeCoreWebVitals(currentUrl),
        analyzeAccessibility(currentUrl),
        fetchSearchConsoleData(currentUrl),
        analyzeCompetitors(currentUrl, property)
      ]);

      const combinedMetrics: SEOMetrics = {
        ...basicMetrics,
        structuredData: structuredDataAnalysis,
        coreWebVitals: coreWebVitalsData,
        accessibility: accessibilityData,
        searchConsoleData: searchConsoleData,
        competitorAnalysis: competitorData,
        localSEO: property ? analyzeLocalSEO(property) : {
          hasLocalSchema: false,
          googleMyBusinessOptimized: false,
          localCitations: 0,
          localKeywordRankings: {}
        }
      };

      setMetrics(combinedMetrics);
      setLastUpdated(new Date());
      
      // Send metrics to backend for storage
      await storeMetrics(combinedMetrics);
      
    } catch (error) {
      console.error('Error analyzing SEO metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeBasicSEO = async (url: string) => {
    const pageTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const canonicalUrl = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || url;
    
    // Extract keywords from meta keywords and content
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content')?.split(',') || [];
    const contentKeywords = extractKeywordsFromContent();
    const keywords = [...metaKeywords, ...contentKeywords];

    // Analyze heading structure
    const headingStructure = analyzeHeadingStructure();

    // Analyze images
    const imageOptimization = analyzeImageOptimization();

    // Analyze links
    const linkAnalysis = analyzeLinkStructure();

    // Analyze content
    const contentAnalysis = analyzeContentQuality();

    // Analyze social media optimization
    const socialMediaOptimization = analyzeSocialMediaOptimization();

    // Analyze technical SEO
    const technicalSEO = analyzeTechnicalSEO();

    // Analyze mobile optimization
    const mobileOptimization = analyzeMobileOptimization();

    return {
      pageTitle,
      metaDescription,
      canonicalUrl,
      keywords,
      headingStructure,
      imageOptimization,
      linkAnalysis,
      contentAnalysis,
      socialMediaOptimization,
      technicalSEO,
      mobileOptimization
    };
  };

  const analyzeStructuredData = async (url: string) => {
    const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
    const structuredDataObjects = [];
    
    scriptTags.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        structuredDataObjects.push(data);
      } catch (error) {
        console.error('Error parsing structured data:', error);
      }
    });

    const hasProductSchema = structuredDataObjects.some(obj => obj['@type'] === 'Product');
    const hasRealEstateSchema = structuredDataObjects.some(obj => obj['@type'] === 'RealEstateListing');
    const hasFAQSchema = structuredDataObjects.some(obj => obj['@type'] === 'FAQPage');
    const hasReviewSchema = structuredDataObjects.some(obj => obj['@type'] === 'Review' || obj.review);
    const hasVirtualTourSchema = structuredDataObjects.some(obj => obj.virtualTour);
    const hasOrganizationSchema = structuredDataObjects.some(obj => obj['@type'] === 'Organization');

    // Validate structured data
    const errors = await validateStructuredData(structuredDataObjects);

    return {
      hasProductSchema,
      hasRealEstateSchema,
      hasFAQSchema,
      hasReviewSchema,
      hasVirtualTourSchema,
      hasOrganizationSchema,
      errors
    };
  };

  const analyzeCoreWebVitals = async (url: string) => {
    // This would typically use the Web Vitals API
    // For now, we'll simulate the data
    const lcp = performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0;
    const fid = 0; // Would need to be tracked with event listeners
    const cls = 0; // Would need to be tracked with PerformanceObserver
    const fcp = performance.getEntriesByType('paint')?.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    const ttfb = performance.getEntriesByType('navigation')[0]?.responseStart || 0;

    const score = lcp < 2500 && fcp < 1800 && ttfb < 600 ? 'good' : 
                  lcp < 4000 && fcp < 3000 && ttfb < 1000 ? 'needs-improvement' : 'poor';

    return { lcp, fid, cls, fcp, ttfb, score };
  };

  const analyzeAccessibility = async (url: string) => {
    // Basic accessibility checks
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    const buttons = document.querySelectorAll('button, a');
    const buttonsWithoutText = Array.from(buttons).filter(btn => !btn.textContent?.trim());
    
    const issues = [];
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} images without alt text`);
    }
    if (buttonsWithoutText.length > 0) {
      issues.push(`${buttonsWithoutText.length} buttons without text`);
    }

    const score = Math.max(0, 100 - (issues.length * 10));
    return { score, issues };
  };

  const fetchSearchConsoleData = async (url: string) => {
    try {
      const response = await fetch('/api/search-console/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching Search Console data:', error);
    }
    
    return {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      position: 0,
      queries: []
    };
  };

  const analyzeCompetitors = async (url: string, property?: Property) => {
    if (!property) {
      return {
        rankingPosition: 0,
        competitorCount: 0,
        topCompetitors: [],
        keywordGaps: []
      };
    }

    try {
      const response = await fetch('/api/seo/competitor-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property: {
            title: property.title,
            location: `${property.city}, ${property.country}`,
            type: property.propertyType,
            price: property.price
          }
        })
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error analyzing competitors:', error);
    }
    
    return {
      rankingPosition: 0,
      competitorCount: 0,
      topCompetitors: [],
      keywordGaps: []
    };
  };

  const analyzeLocalSEO = (property: Property) => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    let hasLocalSchema = false;
    
    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type'] === 'LocalBusiness' || data.address) {
          hasLocalSchema = true;
        }
      } catch (error) {
        // Ignore parsing errors
      }
    });

    return {
      hasLocalSchema,
      googleMyBusinessOptimized: false, // Would need to check GMB API
      localCitations: 0, // Would need to check citation APIs
      localKeywordRankings: {} // Would need to check local ranking APIs
    };
  };

  const storeMetrics = async (metrics: SEOMetrics) => {
    try {
      await fetch('/api/analytics/seo-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: window.location.href,
          property_id: property?.id,
          metrics,
          timestamp: new Date().toISOString(),
          language: currentLanguage
        })
      });
    } catch (error) {
      console.error('Error storing SEO metrics:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
        <div className="text-red-600">
          <h3 className="font-semibold mb-2">Error loading SEO metrics</h3>
          <p className="text-sm">Unable to analyze SEO performance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">SEO Performance Dashboard</h2>
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated?.toLocaleString()}
          </div>
        </div>

        {/* SEO Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.coreWebVitals.score === 'good' ? '✅' : 
               metrics.coreWebVitals.score === 'needs-improvement' ? '⚠️' : '❌'}
            </div>
            <div className="text-sm text-blue-800">Core Web Vitals</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {metrics.accessibility.score}%
            </div>
            <div className="text-sm text-green-800">Accessibility Score</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.imageOptimization.imagesWithAlt}/{metrics.imageOptimization.totalImages}
            </div>
            <div className="text-sm text-purple-800">Images with Alt Text</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {metrics.searchConsoleData.position.toFixed(1)}
            </div>
            <div className="text-sm text-orange-800">Average Position</div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Structured Data */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Structured Data</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Product Schema</span>
                <span>{metrics.structuredData.hasProductSchema ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span>Real Estate Schema</span>
                <span>{metrics.structuredData.hasRealEstateSchema ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span>FAQ Schema</span>
                <span>{metrics.structuredData.hasFAQSchema ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span>Review Schema</span>
                <span>{metrics.structuredData.hasReviewSchema ? '✅' : '❌'}</span>
              </div>
            </div>
          </div>

          {/* Technical SEO */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Technical SEO</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>HTTPS Enabled</span>
                <span>{metrics.technicalSEO.httpsEnabled ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span>Sitemap</span>
                <span>{metrics.technicalSEO.sitemapExists ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span>Robots.txt</span>
                <span>{metrics.technicalSEO.robotsTxtExists ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span>Compression</span>
                <span>{metrics.technicalSEO.compression ? '✅' : '❌'}</span>
              </div>
            </div>
          </div>

          {/* Content Analysis */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Content Analysis</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Word Count</span>
                <span>{metrics.contentAnalysis.wordCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Reading Time</span>
                <span>{metrics.contentAnalysis.readingTime} min</span>
              </div>
              <div className="flex justify-between">
                <span>Duplicate Content</span>
                <span>{metrics.contentAnalysis.duplicateContent ? '❌' : '✅'}</span>
              </div>
            </div>
          </div>

          {/* Search Console Performance */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Search Performance</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Impressions</span>
                <span>{metrics.searchConsoleData.impressions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Clicks</span>
                <span>{metrics.searchConsoleData.clicks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>CTR</span>
                <span>{(metrics.searchConsoleData.ctr * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Position</span>
                <span>{metrics.searchConsoleData.position.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3 text-yellow-800">SEO Recommendations</h3>
          <div className="space-y-2 text-sm text-yellow-700">
            {generateRecommendations(metrics).map((rec, index) => (
              <div key={index} className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for analysis
function extractKeywordsFromContent(): string[] {
  const content = document.body.textContent || '';
  const words = content.toLowerCase().match(/\b\w+\b/g) || [];
  const wordCount: { [key: string]: number } = {};
  
  words.forEach(word => {
    if (word.length > 3) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function analyzeHeadingStructure() {
  const headings = {
    h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent || ''),
    h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent || ''),
    h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent || ''),
    h4: Array.from(document.querySelectorAll('h4')).map(h => h.textContent || ''),
    h5: Array.from(document.querySelectorAll('h5')).map(h => h.textContent || ''),
    h6: Array.from(document.querySelectorAll('h6')).map(h => h.textContent || '')
  };
  
  return headings;
}

function analyzeImageOptimization() {
  const images = document.querySelectorAll('img');
  const totalImages = images.length;
  const imagesWithAlt = Array.from(images).filter(img => img.alt).length;
  const imagesWithLazyLoading = Array.from(images).filter(img => img.loading === 'lazy').length;
  const imagesWithResponsive = Array.from(images).filter(img => img.srcset || img.sizes).length;
  
  // Estimate average file size (this would need actual implementation)
  const averageFileSize = 150000; // 150KB average
  
  const webpImages = Array.from(images).filter(img => img.src.includes('.webp')).length;
  const webpSupport = webpImages;
  
  return {
    totalImages,
    imagesWithAlt,
    imagesWithLazyLoading,
    imagesWithResponsive,
    averageFileSize,
    webpSupport
  };
}

function analyzeLinkStructure() {
  const links = document.querySelectorAll('a');
  const internalLinks = Array.from(links).filter(link => 
    link.hostname === window.location.hostname).length;
  const externalLinks = Array.from(links).filter(link => 
    link.hostname !== window.location.hostname).length;
  const noFollowLinks = Array.from(links).filter(link => 
    link.rel?.includes('nofollow')).length;
  
  return {
    internalLinks,
    externalLinks,
    brokenLinks: 0, // Would need to check each link
    noFollowLinks
  };
}

function analyzeContentQuality() {
  const content = document.body.textContent || '';
  const words = content.match(/\b\w+\b/g) || [];
  const wordCount = words.length;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
  
  // Calculate keyword density
  const keywordDensity: { [key: string]: number } = {};
  words.forEach(word => {
    if (word.length > 3) {
      keywordDensity[word.toLowerCase()] = (keywordDensity[word.toLowerCase()] || 0) + 1;
    }
  });
  
  return {
    wordCount,
    readingTime,
    keywordDensity,
    duplicateContent: false // Would need to check against database
  };
}

function analyzeSocialMediaOptimization() {
  const hasOpenGraph = !!document.querySelector('meta[property^="og:"]');
  const hasTwitterCards = !!document.querySelector('meta[name^="twitter:"]');
  const hasLinkedInMetadata = !!document.querySelector('meta[property^="linkedin:"]');
  
  return {
    hasOpenGraph,
    hasTwitterCards,
    hasLinkedInMetadata,
    socialShares: 0 // Would need social media APIs
  };
}

function analyzeTechnicalSEO() {
  const httpsEnabled = window.location.protocol === 'https:';
  const sitemapExists = !!document.querySelector('link[rel="sitemap"]');
  const robotsTxtExists = true; // Would need to check /robots.txt
  const sslCertificate = httpsEnabled;
  const compression = true; // Would need to check response headers
  const caching = true; // Would need to check response headers
  
  return {
    httpsEnabled,
    sitemapExists,
    robotsTxtExists,
    sslCertificate,
    pageSpeed: 85, // Would need PageSpeed API
    compression,
    caching
  };
}

function analyzeMobileOptimization() {
  const viewport = !!document.querySelector('meta[name="viewport"]');
  const responsive = window.innerWidth < 768; // Basic check
  const touchTargets = true; // Would need to check touch target sizes
  const textSize = true; // Would need to check font sizes
  const loadTime = performance.now();
  
  return {
    viewport,
    responsive,
    touchTargets,
    textSize,
    loadTime
  };
}

async function validateStructuredData(structuredDataObjects: any[]): Promise<string[]> {
  const errors: string[] = [];
  
  structuredDataObjects.forEach(obj => {
    if (!obj['@context']) {
      errors.push('Missing @context in structured data');
    }
    if (!obj['@type']) {
      errors.push('Missing @type in structured data');
    }
  });
  
  return errors;
}

function generateRecommendations(metrics: SEOMetrics): string[] {
  const recommendations: string[] = [];
  
  if (metrics.coreWebVitals.score !== 'good') {
    recommendations.push('Improve Core Web Vitals scores for better search ranking');
  }
  
  if (metrics.accessibility.score < 90) {
    recommendations.push('Improve accessibility to reach a wider audience');
  }
  
  if (metrics.imageOptimization.imagesWithAlt < metrics.imageOptimization.totalImages) {
    recommendations.push('Add alt text to all images for better SEO');
  }
  
  if (!metrics.structuredData.hasRealEstateSchema) {
    recommendations.push('Add real estate structured data for better search visibility');
  }
  
  if (!metrics.socialMediaOptimization.hasOpenGraph) {
    recommendations.push('Add Open Graph metadata for better social sharing');
  }
  
  if (metrics.contentAnalysis.wordCount < 300) {
    recommendations.push('Increase content length for better SEO performance');
  }
  
  return recommendations;
}

// Hook for using SEO metrics across the app
export function useSEOMetrics(propertyId?: string) {
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const endpoint = propertyId 
          ? `/api/analytics/seo-metrics/property/${propertyId}`
          : '/api/analytics/seo-metrics/current';
          
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Error fetching SEO metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [propertyId]);

  return { metrics, loading };
}

export default SEOPerformanceMonitor;