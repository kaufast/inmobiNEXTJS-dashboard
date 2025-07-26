/**
 * Google Search Console Integration
 * Provides Search Console verification and monitoring utilities
 */

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/hooks/use-language';

// Search Console Configuration
const GSC_VERIFICATION_TAG = process.env.VITE_GSC_VERIFICATION_TAG || '';
const GSC_PROPERTY_URL = process.env.VITE_GSC_PROPERTY_URL || 'https://inmobi.mobi';

interface SearchConsoleData {
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  date: string;
}

interface SearchQuery {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

interface SearchConsolePage {
  page: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

interface SearchConsoleProps {
  enableVerification?: boolean;
  enableSitemap?: boolean;
  enableStructuredData?: boolean;
}

export function SearchConsoleIntegration({ 
  enableVerification = true, 
  enableSitemap = true,
  enableStructuredData = true 
}: SearchConsoleProps) {
  const { currentLanguage } = useLanguage();
  
  // Generate sitemap URLs for different languages
  const generateSitemapUrls = () => {
    const baseUrl = GSC_PROPERTY_URL;
    const sitemaps = [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-pages.xml`,
      `${baseUrl}/sitemap-properties.xml`,
      `${baseUrl}/sitemap-agents.xml`,
      `${baseUrl}/sitemap-${currentLanguage}.xml`
    ];
    
    return sitemaps;
  };

  // Generate robots.txt content
  const generateRobotsTxt = () => {
    const baseUrl = GSC_PROPERTY_URL;
    return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /auth/
Disallow: /debug/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*fbclid*
Disallow: /*?*gclid*

# Sitemap locations
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-pages.xml
Sitemap: ${baseUrl}/sitemap-properties.xml
Sitemap: ${baseUrl}/sitemap-agents.xml

# Language-specific sitemaps
Sitemap: ${baseUrl}/sitemap-en-US.xml
Sitemap: ${baseUrl}/sitemap-es-ES.xml
Sitemap: ${baseUrl}/sitemap-fr-FR.xml
Sitemap: ${baseUrl}/sitemap-de-DE.xml
Sitemap: ${baseUrl}/sitemap-ca-ES.xml
Sitemap: ${baseUrl}/sitemap-es-MX.xml

# Crawl delay
Crawl-delay: 1`;
  };

  return (
    <>
      {enableVerification && GSC_VERIFICATION_TAG && (
        <Helmet>
          <meta name="google-site-verification" content={GSC_VERIFICATION_TAG} />
        </Helmet>
      )}
      
      {enableSitemap && (
        <Helmet>
          {generateSitemapUrls().map(sitemapUrl => (
            <link key={sitemapUrl} rel="sitemap" type="application/xml" href={sitemapUrl} />
          ))}
        </Helmet>
      )}
      
      {enableStructuredData && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Inmobi Real Estate",
              "alternateName": "Inmobi",
              "url": GSC_PROPERTY_URL,
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${GSC_PROPERTY_URL}/search?query={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              },
              "sameAs": [
                "https://www.facebook.com/inmobimobi",
                "https://www.linkedin.com/company/inmobi",
                "https://twitter.com/inmobimobi"
              ]
            })}
          </script>
        </Helmet>
      )}
    </>
  );
}

// Search Console API integration (requires backend implementation)
export class SearchConsoleAPI {
  private apiUrl: string;
  private siteUrl: string;

  constructor(apiUrl: string = '/api/search-console', siteUrl: string = GSC_PROPERTY_URL) {
    this.apiUrl = apiUrl;
    this.siteUrl = siteUrl;
  }

  // Fetch search performance data
  async getSearchPerformance(
    startDate: string,
    endDate: string,
    dimensions: string[] = ['query', 'page', 'country', 'device'],
    filters?: any[]
  ): Promise<SearchConsoleData[]> {
    try {
      const response = await fetch(`${this.apiUrl}/search-performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteUrl: this.siteUrl,
          startDate,
          endDate,
          dimensions,
          filters
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching search performance:', error);
      return [];
    }
  }

  // Fetch top queries
  async getTopQueries(
    startDate: string,
    endDate: string,
    limit: number = 100
  ): Promise<SearchQuery[]> {
    try {
      const response = await fetch(`${this.apiUrl}/top-queries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteUrl: this.siteUrl,
          startDate,
          endDate,
          limit
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching top queries:', error);
      return [];
    }
  }

  // Fetch top pages
  async getTopPages(
    startDate: string,
    endDate: string,
    limit: number = 100
  ): Promise<SearchConsolePage[]> {
    try {
      const response = await fetch(`${this.apiUrl}/top-pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteUrl: this.siteUrl,
          startDate,
          endDate,
          limit
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching top pages:', error);
      return [];
    }
  }

  // Submit URL for indexing
  async submitUrlForIndexing(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/submit-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteUrl: this.siteUrl,
          url
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error submitting URL for indexing:', error);
      return false;
    }
  }

  // Check indexing status
  async checkIndexingStatus(url: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/indexing-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteUrl: this.siteUrl,
          url
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking indexing status:', error);
      return null;
    }
  }

  // Get sitemap status
  async getSitemapStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/sitemap-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteUrl: this.siteUrl
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting sitemap status:', error);
      return null;
    }
  }

  // Submit sitemap
  async submitSitemap(sitemapUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/submit-sitemap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteUrl: this.siteUrl,
          sitemapUrl
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error submitting sitemap:', error);
      return false;
    }
  }
}

// Hook for using Search Console data
export function useSearchConsoleData() {
  const [searchConsoleAPI] = useState(() => new SearchConsoleAPI());
  const [performanceData, setPerformanceData] = useState<SearchConsoleData[]>([]);
  const [topQueries, setTopQueries] = useState<SearchQuery[]>([]);
  const [topPages, setTopPages] = useState<SearchConsolePage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);

    try {
      const [performance, queries, pages] = await Promise.all([
        searchConsoleAPI.getSearchPerformance(startDate, endDate),
        searchConsoleAPI.getTopQueries(startDate, endDate),
        searchConsoleAPI.getTopPages(startDate, endDate)
      ]);

      setPerformanceData(performance);
      setTopQueries(queries);
      setTopPages(pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const submitUrlForIndexing = async (url: string) => {
    try {
      return await searchConsoleAPI.submitUrlForIndexing(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  const checkIndexingStatus = async (url: string) => {
    try {
      return await searchConsoleAPI.checkIndexingStatus(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  return {
    performanceData,
    topQueries,
    topPages,
    loading,
    error,
    fetchData,
    submitUrlForIndexing,
    checkIndexingStatus
  };
}

// Search Console Dashboard Component
export function SearchConsoleDashboard() {
  const { 
    performanceData, 
    topQueries, 
    topPages, 
    loading, 
    error, 
    fetchData 
  } = useSearchConsoleData();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData(dateRange.startDate, dateRange.endDate);
  }, [dateRange]);

  const totalImpressions = performanceData.reduce((sum, data) => sum + data.impressions, 0);
  const totalClicks = performanceData.reduce((sum, data) => sum + data.clicks, 0);
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const averagePosition = performanceData.length > 0 
    ? performanceData.reduce((sum, data) => sum + data.position, 0) / performanceData.length 
    : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
        <div className="text-red-600">
          <h3 className="font-semibold mb-2">Error loading Search Console data</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Search Console Overview</h2>
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {totalImpressions.toLocaleString()}
            </div>
            <div className="text-sm text-blue-800">Total Impressions</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {totalClicks.toLocaleString()}
            </div>
            <div className="text-sm text-green-800">Total Clicks</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {averageCTR.toFixed(1)}%
            </div>
            <div className="text-sm text-purple-800">Average CTR</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {averagePosition.toFixed(1)}
            </div>
            <div className="text-sm text-orange-800">Average Position</div>
          </div>
        </div>

        {/* Top Queries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Top Queries</h3>
            <div className="space-y-2">
              {topQueries.slice(0, 10).map((query, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{query.query}</span>
                  <div className="text-sm text-gray-600">
                    {query.clicks} clicks / {query.impressions} impressions
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Pages */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
            <div className="space-y-2">
              {topPages.slice(0, 10).map((page, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium truncate">{page.page}</span>
                  <div className="text-sm text-gray-600">
                    {page.clicks} clicks / {page.impressions} impressions
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchConsoleIntegration;