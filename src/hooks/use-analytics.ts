import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

export interface AnalyticsKPIs {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  soldListings: number;
  totalLeads: number;
  totalViews: number;
  conversionRate: number;
  totalRevenue: number;
  averageDealSize: number;
}

export interface PropertyPerformance {
  propertyId: number;
  title: string;
  views: number;
  inquiries: number;
  tours: number;
  favorites: number;
  conversionRate: number;
}

export interface TimeSeriesData {
  date: string;
  views: number;
  inquiries: number;
  tours: number;
  conversions: number;
}

export interface TrafficSourceData {
  source: string;
  sessions: number;
  users: number;
  bounceRate: number;
  avgDuration: number;
}

export interface DashboardData {
  kpis: AnalyticsKPIs;
  topProperties: PropertyPerformance[];
  timeseries: TimeSeriesData[];
  trafficSources: TrafficSourceData[];
  insights: string[];
  period: {
    start: string;
    end: string;
  };
  scope: 'agent' | 'agency';
}

export interface AnalyticsFilters {
  period?: 'today' | '7days' | '30days' | '90days' | 'year';
  startDate?: string;
  endDate?: string;
  scope?: 'agent' | 'agency';
  granularity?: 'day' | 'week' | 'month';
}

export function useAnalytics(filters: AnalyticsFilters = {}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.period) params.append('period', filters.period);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.scope) params.append('scope', filters.scope);

      const response = await fetch(`/api/analytics/dashboard?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters.period, filters.startDate, filters.endDate, filters.scope, user]);

  const trackEvent = async (
    eventType: string,
    entityType: string,
    entityId: number,
    metadata?: Record<string, any>
  ) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          eventType,
          entityType,
          entityId,
          metadata,
        }),
      });
    } catch (err) {
      console.error('Failed to track event:', err);
    }
  };

  const createLead = async (leadData: {
    propertyId: number;
    name?: string;
    email?: string;
    phone?: string;
    source?: string;
    budget?: number;
    timeframe?: string;
    notes?: string;
  }) => {
    try {
      const response = await fetch('/api/analytics/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        throw new Error('Failed to create lead');
      }

      const result = await response.json();
      
      // Refresh analytics after creating a lead
      fetchAnalytics();
      
      return result.lead;
    } catch (err) {
      console.error('Failed to create lead:', err);
      throw err;
    }
  };

  const exportData = async (format: 'csv' = 'csv') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (filters.period) params.append('period', filters.period);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.scope) params.append('scope', filters.scope);

      const response = await fetch(`/api/analytics/export?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
    trackEvent,
    createLead,
    exportData,
  };
}

// Specialized hooks for specific analytics data
export function useAnalyticsKPIs(filters: AnalyticsFilters = {}) {
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.period) params.append('period', filters.period);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.scope) params.append('scope', filters.scope);

        const response = await fetch(`/api/analytics/kpis?${params}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch KPIs');
        }

        const data = await response.json();
        setKpis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch KPIs');
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, [filters.period, filters.startDate, filters.endDate, filters.scope]);

  return { kpis, loading, error };
}

export function usePropertyPerformance(filters: AnalyticsFilters = {}, limit: number = 10) {
  const [properties, setProperties] = useState<PropertyPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        if (filters.period) params.append('period', filters.period);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.scope) params.append('scope', filters.scope);

        const response = await fetch(`/api/analytics/properties?${params}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch property performance');
        }

        const data = await response.json();
        setProperties(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters.period, filters.startDate, filters.endDate, filters.scope, limit]);

  return { properties, loading, error };
}