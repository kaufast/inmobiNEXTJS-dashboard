import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DashboardStep2 = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800">InMobi Dashboard</h1>
        </div>
        <nav className="mt-8">
          <div className="px-4 py-2">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Menu
            </h2>
          </div>
          <ul className="mt-2">
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <span className="mr-3">🏠</span>
                Dashboard
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <span className="mr-3">🏢</span>
                Properties
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <span className="mr-3">👥</span>
                Users
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <span className="mr-3">📊</span>
                Analytics
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <span className="mr-3">⚙️</span>
                Settings
              </Button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome back!</span>
              <Button size="sm" className="rounded-full">
                <span className="text-sm">U</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Dashboard Cards using shadcn/ui */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Properties
                  </CardTitle>
                  <span className="text-2xl">🏢</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <span className="text-2xl">👥</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Monthly Revenue
                  </CardTitle>
                  <span className="text-2xl">💰</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€12,450</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">
                        New property listed: Modern Apartment in Barcelona
                      </span>
                      <Button size="sm" variant="outline" className="ml-auto">
                        View
                      </Button>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">
                        User John Doe registered
                      </span>
                      <Button size="sm" variant="outline" className="ml-auto">
                        View
                      </Button>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">
                        Payment received: €1,200
                      </span>
                      <Button size="sm" variant="outline" className="ml-auto">
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <div className="flex gap-4">
                <Button>Add Property</Button>
                <Button variant="outline">View Reports</Button>
                <Button variant="secondary">Export Data</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardStep2;