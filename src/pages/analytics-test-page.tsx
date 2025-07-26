import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function AnalyticsTestPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Test Page</h2>
          <p className="text-muted-foreground">
            Simple test page to debug analytics issues
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>If you can see this, the basic page structure is working.</p>
            <p>Current time: {new Date().toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics API Test</CardTitle>
          </CardHeader>
          <CardContent>
            <button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/analytics/dashboard', {
                    credentials: 'include',
                  });
                  const data = await response.json();
                  console.log('Analytics API response:', data);
                  alert('Check console for analytics data');
                } catch (error) {
                  console.error('Analytics API error:', error);
                  alert('Analytics API error: ' + error.message);
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Analytics API
            </button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 