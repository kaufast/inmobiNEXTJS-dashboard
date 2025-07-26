import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Settings, 
  Bell,
  Search,
  User,
  ChevronRight,
  Euro,
  Users,
  Shield,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin,
  Filter,
  MoreHorizontal,
  Plus,
  Activity,
  Target,
  Moon,
  Sun
} from 'lucide-react';

const ModernCrowdlendingDashboard = () => {
  const { t } = useTranslation('fund');
  const [activeView, setActiveView] = useState('overview');
  const [timeframe, setTimeframe] = useState('week');

  const sidebarItems = [
    { id: 'overview', icon: Home, label: 'Overview' },
    { id: 'investments', icon: TrendingUp, label: 'My Investments' },
    { id: 'projects', icon: BarChart3, label: 'Active Projects' },
    { id: 'analytics', icon: Activity, label: 'Analytics' },
    { id: 'targets', icon: Target, label: 'Goals' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  // Mock chart data for different timeframes
  const chartData = {
    week: [
      { day: 'Mon', value: 45200, growth: 2.1 },
      { day: 'Tue', value: 45850, growth: 1.4 },
      { day: 'Wed', value: 46200, growth: 0.8 },
      { day: 'Thu', value: 47100, growth: 1.9 },
      { day: 'Fri', value: 47250, growth: 0.3 },
      { day: 'Sat', value: 47180, growth: -0.1 },
      { day: 'Sun', value: 47250, growth: 0.1 },
    ],
    month: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      value: 45000 + Math.random() * 3000,
      growth: (Math.random() - 0.5) * 4,
    })),
    year: Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      value: 40000 + i * 1000 + Math.random() * 2000,
      growth: Math.random() * 3,
    })),
  };

  const portfolioStats = [
    {
      title: 'Portfolio Value',
      value: '€47,250',
      change: '+12.5%',
      trend: 'up',
      subtitle: 'vs last month'
    },
    {
      title: 'Active Projects',
      value: '12',
      change: '+2',
      trend: 'up',
      subtitle: 'this quarter'
    },
    {
      title: 'Annual Return',
      value: '8.7%',
      change: '+0.3%',
      trend: 'up',
      subtitle: 'vs target 8.0%'
    },
    {
      title: 'Next Payment',
      value: '€1,240',
      change: 'in 5 days',
      trend: 'neutral',
      subtitle: 'Valencia Project'
    }
  ];

  const recentProjects = [
    {
      name: 'Madrid Luxury Residences',
      location: 'Salamanca, Madrid',
      progress: 78,
      invested: '€15,240',
      return: '9.2%',
      status: 'On Track',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop'
    },
    {
      name: 'Barcelona Tech Hub',
      location: '22@, Barcelona',
      progress: 45,
      invested: '€12,100',
      return: '8.5%',
      status: 'In Progress',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=200&fit=crop'
    },
    {
      name: 'Valencia Beach Resort',
      location: 'Malvarosa, Valencia',
      progress: 92,
      invested: '€8,750',
      return: '11.1%',
      status: 'Nearly Complete',
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=300&h=200&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-black flex">
      {/* Enhanced Icon-Only Sidebar with Modern Tooltips */}
      <div className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-4 border-r border-gray-700">
        {/* Logo with Glow Effect */}
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>

        {/* Enhanced Navigation Icons */}
        <nav className="flex-1 flex flex-col space-y-3">
          {sidebarItems.map((item) => (
            <div key={item.id} className="relative group">
              <button
                onClick={() => setActiveView(item.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  activeView === item.id
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700 hover:scale-105'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </button>
              
              {/* Enhanced Modern Tooltip */}
              <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-700">
                {item.label}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-700"></div>
              </div>
            </div>
          ))}
        </nav>

        {/* Enhanced Theme Toggle */}
        <div className="relative group">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-300 hover:scale-105">
            <Moon className="w-5 h-5" />
          </button>
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-700">
            Dark Mode
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-700"></div>
          </div>
        </div>

        {/* Enhanced User Profile */}
        <div className="relative group">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform duration-300 cursor-pointer">
            <User className="w-5 h-5 text-white" />
          </div>
          
          {/* Enhanced Profile Tooltip */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-4 py-3 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-700">
            <div className="font-medium">Anna Martinez</div>
            <div className="text-xs text-gray-400 mt-1">Premium Investor</div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-700"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black">
        {/* Top Navigation Bar */}
        <header className="bg-gray-800 border-b border-gray-700">
          {/* Compact Top Bar */}
          <div className="px-6 py-3 flex items-center justify-between">
            {/* Left: Logo + Key Navigation */}
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Key Navigation Tabs */}
              <nav className="flex items-center space-x-1">
                {[
                  { id: 'home', label: 'Home', icon: Home },
                  { id: 'activities', label: 'Activities', icon: Activity },
                  { id: 'health', label: 'Health status', icon: Shield },
                  { id: 'planning', label: 'Planning', icon: Calendar }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveView(tab.id)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-200 text-sm ${
                        activeView === tab.id || tab.id === 'home'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right: User Actions */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600 transition-all">
                <Moon className="w-4 h-4" />
              </button>

              {/* Notifications */}
              <button className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600 transition-all relative">
                <Bell className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm font-medium">Anna</span>
              </div>
            </div>
          </div>
        </header>

        {/* Welcome Section */}
        <div className="px-6 py-6 bg-black">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Hello, Anna
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                <Search className="w-4 h-4" />
                <span className="text-sm">Search</span>
              </button>

              {/* Calendar */}
              <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Calendar</span>
              </button>

              {/* ChatBot */}
              <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-sm">ChatBot AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* Placeholder for search input */}
        <div className="hidden">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
          
          {/* Calendar */}
          <button className="flex items-center space-x-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>Calendar</span>
          </button>
          
          {/* ChatBot AI */}
          <button className="flex items-center space-x-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span>ChatBot AI</span>
          </button>
        </div>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6 bg-black">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Enhanced Left Sidebar */}
            <div className="space-y-6">
              {/* Enhanced Activities Card */}
              <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span className="font-semibold">Activities</span>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                  </div>
                  
                  {/* Streak Notification */}
                  <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm opacity-90 mb-1">⭐ Portfolio growth streak</div>
                        <div className="text-2xl font-bold">7 days</div>
                      </div>
                      <div className="text-3xl">🔥</div>
                    </div>
                  </div>

                  {/* This Week Performance */}
                  <div className="mb-6">
                    <div className="text-sm opacity-90 mb-2">This week</div>
                    <div className="text-3xl font-bold mb-1">€2,450</div>
                    <div className="text-sm opacity-90">Revenue earned</div>
                    <div className="text-sm text-green-300 mt-1">+12.5% from last week</div>
                  </div>

                  {/* Enhanced Interactive Week Chart */}
                  <div className="mb-4">
                    <div className="flex items-end justify-between space-x-2 h-20 mb-2">
                      {[
                        { height: 40, value: 320 },
                        { height: 60, value: 480 },
                        { height: 35, value: 280 },
                        { height: 80, value: 640 },
                        { height: 55, value: 440 },
                        { height: 90, value: 720 },
                        { height: 70, value: 560 }
                      ].map((bar, i) => (
                        <div key={i} className="flex-1 group cursor-pointer">
                          <div 
                            className="w-full bg-white/40 rounded-t-lg transition-all duration-300 group-hover:bg-white/60 group-hover:scale-105" 
                            style={{height: `${bar.height}%`}}
                          ></div>
                          <div className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-center mt-1">
                            €{bar.value}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs opacity-80">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                        <span key={i} className="text-center flex-1">{day}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Enhanced Decorative Elements */}
                <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-white/5 rounded-full"></div>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                <div className="absolute top-8 right-8 w-1 h-1 bg-white/20 rounded-full animate-pulse"></div>
              </div>

              {/* Enhanced Portfolio Score with Circular Progress */}
              <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold">Portfolio Score</h3>
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </div>
                
                {/* Circular Progress Indicator */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-24 h-24 mb-4">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle 
                        cx="50" cy="50" r="40" 
                        stroke="rgb(55, 65, 81)" 
                        strokeWidth="8" 
                        fill="none"
                      />
                      {/* Progress circle */}
                      <circle 
                        cx="50" cy="50" r="40" 
                        stroke="rgb(249, 115, 22)" 
                        strokeWidth="8" 
                        fill="none"
                        strokeDasharray={`${85 * 2.51} ${100 * 2.51}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">8.5</div>
                        <div className="text-xs text-orange-400">/ 10</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-400 font-semibold mb-1">Excellent</div>
                    <div className="text-xs text-gray-400">85th percentile</div>
                  </div>
                </div>

                {/* Enhanced Metrics */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Risk Level</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i <= 3 ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
                        ))}
                      </div>
                      <span className="text-white text-sm">Medium</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Diversification</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                      </div>
                      <span className="text-white text-sm">Good</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Performance</span>
                    <div className="text-green-400 text-sm font-medium">+12.5%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Performance Chart */}
              <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white font-medium mb-1">Portfolio Value</h3>
                    <div className="text-3xl font-bold text-white">€47,250</div>
                    <div className="text-sm text-green-400">+12.5% this month</div>
                  </div>
                  <div className="flex space-x-2">
                    {['Week', 'Month', 'Year'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setTimeframe(period.toLowerCase())}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          timeframe === period.toLowerCase()
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart */}
                <div className="h-48 flex items-end justify-between space-x-2">
                  {chartData[timeframe]?.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg"
                        style={{ height: `${(item.value / 50000) * 160}px` }}
                      ></div>
                      <div className="text-xs text-gray-400 mt-2">{item.day}</div>
                    </div>
                  )) || (
                    <div className="w-full h-32 flex items-center justify-center text-gray-400">
                      Chart data loading...
                    </div>
                  )}
                </div>
              </div>

              {/* Investment Breakdown */}
              <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-medium">Investment Analysis</h3>
                  <button className="text-orange-400 text-sm hover:text-orange-300">Show all</button>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Residential', amount: '€25,430', change: '+12.5%', percent: 68, color: 'from-orange-500 to-orange-400' },
                    { name: 'Commercial', amount: '€12,820', change: '+8.3%', percent: 34, color: 'from-blue-500 to-blue-400' },
                    { name: 'Mixed Use', amount: '€9,000', change: '+4.1%', percent: 24, color: 'from-green-500 to-green-400' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">{item.name}</span>
                        <div className="text-right">
                          <div className="text-white text-sm">{item.amount}</div>
                          <div className="text-green-400 text-xs">{item.change}</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${item.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Featured Investment */}
              <div className="bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="text-sm opacity-90 mb-2">{t('investment.featuredProject')}</div>
                  <h3 className="font-semibold mb-3">Barcelona Modern Loft</h3>
                  <div className="bg-white/20 rounded-2xl p-4 space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="opacity-90">Expected Return</span>
                      <span className="font-semibold">9.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">Min Investment</span>
                      <span className="font-semibold">€500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">Time Left</span>
                      <span className="font-semibold">23 days</span>
                    </div>
                  </div>
                  <button className="w-full bg-white/20 hover:bg-white/30 transition-colors py-3 rounded-xl font-medium">
                    Invest Now
                  </button>
                </div>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
                <h3 className="text-white font-medium mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white text-sm">New Investment</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white text-sm">View Reports</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <Euro className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white text-sm">Withdraw Funds</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
                <h3 className="text-white font-medium mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { icon: '💰', text: 'Dividend received', amount: '+€125', time: '2h ago' },
                    { icon: '🏢', text: 'New project funded', amount: '', time: '5h ago' },
                    { icon: '📊', text: 'Portfolio rebalanced', amount: '', time: '1d ago' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-lg">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm">{item.text}</div>
                        <div className="text-gray-400 text-xs">{item.time}</div>
                      </div>
                      {item.amount && (
                        <div className="text-green-400 text-sm font-medium">{item.amount}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernCrowdlendingDashboard;
