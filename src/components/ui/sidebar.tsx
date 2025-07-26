import * as React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-mobile";
import {
  Home,
  BarChart3,
  Target,
  Moon,
  Zap,
  Activity,
  Plus,
  Calendar,
  MessageSquare,
  Settings,
  User,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  userName?: string;
}

export function Sidebar({ className, children, userName = "Anna", ...props }: SidebarProps) {
  const [location] = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const navigationItems = [
    { icon: Home, href: "/", label: "Home" },
    { icon: BarChart3, href: "/activities", label: "Activities" },
    { icon: Target, href: "/health", label: "Health Status" },
    { icon: Calendar, href: "/training", label: "Training Planning" },
    { icon: MessageSquare, href: "/chat", label: "ChatBot AI" },
  ];

  const sidebarItems = [
    { icon: Activity, active: false },
    { icon: BarChart3, active: false },
    { icon: Target, active: true },
    { icon: Moon, active: false },
    { icon: Zap, active: false },
  ];

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const progressData = [65, 45, 80, 70, 30, 90, 55];

  if (isMobile) {
    return (
      <div className={cn("min-h-screen bg-black text-white p-4", className)} {...props}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gray-400 text-sm">Hello, {userName}</p>
            <Button
              variant="ghost"
              className="text-white hover:bg-orange-500 bg-orange-500/20 rounded-full px-4 py-2 mt-2"
            >
              <Activity className="w-4 h-4 mr-2" />
              Activities
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-green-400 hover:bg-green-500/20 rounded-full"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Stats Cards */}
        <div className="space-y-6">
          {/* Week/Month Toggle */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tracking area</h2>
            <Button
              variant="ghost"
              className="text-white bg-gray-800 rounded-full px-4 py-1 text-sm"
            >
              Monthly <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Weekly Progress Rings */}
          <div className="flex justify-between items-center">
            {weekdays.map((day, index) => {
              const progress = progressData[index];
              const isToday = day === currentDay.charAt(0).toUpperCase();
              return (
                <div key={day} className="flex flex-col items-center">
                  <div className={cn(
                    "relative w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium",
                    isToday 
                      ? "bg-orange-500 text-white" 
                      : progress > 50 
                        ? "bg-gray-700 text-white"
                        : "bg-gray-800 text-gray-400"
                  )}>
                    <div className={cn(
                      "absolute inset-0 rounded-full",
                      isToday ? "border-2 border-orange-500" : ""
                    )}>
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="20"
                          cy="20"
                          r="18"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray={`${progress * 1.13} 113`}
                          className={isToday ? "text-orange-400" : "text-gray-600"}
                        />
                      </svg>
                    </div>
                    <span className="relative z-10">{day}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart Area */}
          <div className="relative">
            <div className="flex items-end justify-between h-32 px-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, index) => {
                const height = [20, 40, 60, 80, 100, 85, 45][index];
                const isActive = month === 'Jun';
                return (
                  <div key={month} className="flex flex-col items-center">
                    <div 
                      className={cn(
                        "w-8 rounded-t-lg mb-2",
                        isActive ? "bg-orange-500" : "bg-gray-700"
                      )}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-400">{month}</span>
                  </div>
                );
              })}
            </div>
            <div className="absolute top-4 left-4">
              <Badge className="bg-white text-black px-2 py-1 text-xs">
                Avg 6.8%
              </Badge>
            </div>
            <div className="absolute top-4 right-4">
              <span className="text-orange-400 text-sm font-semibold">57.00</span>
            </div>
          </div>

          {/* Weight Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Weight Breakdown</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-5 h-5 bg-white rounded mr-2 flex items-center justify-center">
                      <div className="w-3 h-3 bg-black rounded" />
                    </div>
                    <span className="text-sm text-gray-400">Weight Log</span>
                  </div>
                  <p className="text-2xl font-bold text-white">57.2 kg</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <Activity className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400">Average Wt</span>
                  </div>
                  <p className="text-2xl font-bold text-white">041 kg</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <User className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400">Current wt</span>
                  </div>
                  <p className="text-2xl font-bold text-white">52.9 kg</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <Target className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400">Wt Track</span>
                  </div>
                  <p className="text-2xl font-bold text-white">68.2 kg</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Days Meals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Days Meals</h3>
              <Button variant="ghost" className="text-orange-400 text-sm">
                View All →
              </Button>
            </div>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                      <div className="w-4 h-4 bg-white rounded" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Breakfast</p>
                      <p className="text-gray-400 text-sm">680 kcal</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("flex h-screen", className)} {...props}>
      {/* Desktop Sidebar */}
      <div className="w-20 bg-gray-900 flex flex-col items-center py-8 space-y-6">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className={cn(
                "w-12 h-12 rounded-xl transition-colors flex items-center justify-center p-3",
                item.active 
                  ? "bg-orange-500 text-white hover:bg-orange-600" 
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="w-6 h-6" />
            </Button>
          );
        })}
      </div>

      {/* Desktop Main Content */}
      <div className="flex-1 bg-black text-white">
        {/* Desktop Header */}
        <div className="border-b border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-white text-black hover:bg-gray-200"
                          : "text-white hover:bg-gray-800"
                      )}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button variant="ghost" className="text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                ChatBot AI
              </Button>
            </div>
          </div>
        </div>
        
        {/* Desktop Content */}
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2">Hello, {userName}</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// Legacy components for backward compatibility
interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, children, ...props }: SidebarHeaderProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({ className, children, ...props }: SidebarContentProps) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenu({ className, children, ...props }: SidebarMenuProps) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      {children}
    </div>
  );
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  active?: boolean;
}

export function SidebarMenuItem({ 
  className, 
  href, 
  active, 
  children, 
  ...props 
}: SidebarMenuItemProps) {
  return (
    <Link href={href}>
      <a 
        className={cn(
          "flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-100", 
          active && "bg-neutral-100 text-primary",
          className
        )} 
        {...props}
      >
        {children}
      </a>
    </Link>
  );
}