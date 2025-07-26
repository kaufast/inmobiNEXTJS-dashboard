import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SharedCalendar, CalendarStats } from '@/components/calendar/SharedCalendar';
import { TourDetailsModal } from '@/components/calendar/TourDetailsModal';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Eye,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { CalendarAPI } from '@/services/CalendarAPI';
import { CalendarEvent, TourBooking } from '@/shared/schemas/calendar';
import { format } from 'date-fns';

export function CalendarAdminDashboard() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'bookings' | 'analytics'>('overview');

  // Fetch calendar statistics
  const { data: calendarStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-calendar-stats'],
    queryFn: () => CalendarAPI.getStats(),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch recent bookings
  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: () => fetch('/api/admin/calendar/recent-bookings').then(res => res.json()),
    refetchInterval: 30000
  });

  // Fetch calendar analytics
  const { data: analytics } = useQuery({
    queryKey: ['admin-calendar-analytics'],
    queryFn: () => CalendarAPI.getAnalytics(),
    refetchInterval: 60000 // Refresh every minute
  });

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      reschedule_requested: 'bg-orange-100 text-orange-800 border-orange-300',
      no_show: 'bg-slate-100 text-slate-800 border-slate-300'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="calendar-admin-dashboard space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Calendar Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage property tour bookings and agent schedules
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tours Today</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : calendarStats?.toursToday || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statsLoading ? '...' : calendarStats?.pendingToday || 0} pending confirmation
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : calendarStats?.toursThisWeek || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{statsLoading ? '...' : calendarStats?.weekGrowth || 0}% from last week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : calendarStats?.completionRate || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Of scheduled tours completed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : calendarStats?.activeAgents || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  With upcoming tours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentBookings && recentBookings.length > 0 ? (
                  <div className="space-y-3">
                    {recentBookings.slice(0, 5).map((booking: TourBooking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{booking.property?.title || 'Property Tour'}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.user?.fullName} • {format(new Date(booking.requestedDateTime), 'MMM dd, h:mm a')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
                            {booking.status.replace('_', ' ')}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                    <p>No recent bookings</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarStats userType="admin" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <SharedCalendar
                view="week"
                userType="admin"
                height={700}
                onEventSelect={handleEventSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Tour Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="animate-pulse border rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div className="w-20 h-6 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentBookings && recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking: TourBooking) => (
                    <Card key={booking.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-semibold">{booking.property?.title || 'Property Tour'}</h4>
                              <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
                                {booking.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-3 w-3" />
                                  <span>{booking.property?.address || 'Address not available'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CalendarIcon className="h-3 w-3" />
                                  <span>{format(new Date(booking.requestedDateTime), 'EEEE, MMMM do, yyyy')}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-3 w-3" />
                                  <span>{format(new Date(booking.requestedDateTime), 'h:mm a')}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <Users className="h-3 w-3" />
                                  <span>Client: {booking.user?.fullName || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Users className="h-3 w-3" />
                                  <span>Agent: {booking.agent?.fullName || 'Unknown'}</span>
                                </div>
                                {booking.userNotes && (
                                  <div className="text-xs">
                                    <span className="font-medium">Notes:</span> {booking.userNotes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Convert booking to CalendarEvent format for modal
                                const event: CalendarEvent = {
                                  id: booking.id,
                                  title: booking.property?.title || 'Property Tour',
                                  start: new Date(booking.requestedDateTime),
                                  end: new Date(new Date(booking.requestedDateTime).getTime() + (booking.durationMinutes || 60) * 60000),
                                  status: booking.status,
                                  property: {
                                    id: booking.property?.id || 0,
                                    title: booking.property?.title || 'Unknown Property',
                                    address: booking.property?.address || ''
                                  },
                                  user: {
                                    id: booking.user?.id || 0,
                                    name: booking.user?.fullName || 'Unknown User',
                                    email: booking.user?.email || ''
                                  },
                                  agent: {
                                    id: booking.agent?.id || 0,
                                    name: booking.agent?.fullName || 'Unknown Agent',
                                    email: booking.agent?.email || ''
                                  },
                                  isVirtual: booking.isVirtual || false,
                                  meetingLink: booking.meetingLink,
                                  notes: booking.userNotes
                                };
                                setSelectedEvent(event);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                  <p>Tour bookings will appear here once they are created.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <p>Booking trends chart</p>
                    <p className="text-sm">Analytics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p>Peak hours chart</p>
                    <p className="text-sm">Analytics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tour Details Modal */}
      {selectedEvent && (
        <TourDetailsModal
          booking={selectedEvent}
          userType="admin"
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

export default CalendarAdminDashboard;