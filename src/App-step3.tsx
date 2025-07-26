import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DashboardStep3 = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: '', role: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock login
    setUser({ name: 'John Doe', role: 'Admin' });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser({ name: '', role: '' });
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>InMobi Dashboard Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@inmobi.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Password" />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
            <div className="mt-4 text-sm text-gray-600">
              <p>Demo credentials:</p>
              <p>Email: admin@inmobi.com</p>
              <p>Password: any password</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800">InMobi Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome, {user.name}</p>
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

        {/* User section at bottom */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome back, {user.name}!</span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full">
                    <span className="text-sm">{user.name.charAt(0)}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>User Profile</DialogTitle>
                    <DialogDescription>
                      Manage your account settings and preferences.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={user.name} readOnly />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input value={user.role} readOnly />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Edit Profile</Button>
                      <Button onClick={handleLogout}>Logout</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Dashboard Cards */}
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

            {/* Quick Actions */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="h-20 flex flex-col">
                          <span className="text-2xl mb-2">🏢</span>
                          Add Property
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Property</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Property Title</Label>
                            <Input placeholder="Enter property title" />
                          </div>
                          <div>
                            <Label>Price</Label>
                            <Input placeholder="Enter price" />
                          </div>
                          <Button className="w-full">Add Property</Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button className="h-20 flex flex-col" variant="outline">
                      <span className="text-2xl mb-2">👥</span>
                      Add User
                    </Button>

                    <Button className="h-20 flex flex-col" variant="outline">
                      <span className="text-2xl mb-2">📊</span>
                      View Reports
                    </Button>

                    <Button className="h-20 flex flex-col" variant="outline">
                      <span className="text-2xl mb-2">⚙️</span>
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardStep3;