import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Video,
  Phone,
  Mail,
  Edit,
  X,
  Check,
  RefreshCw
} from 'lucide-react';
import { CalendarEvent, TourBooking, TourStatus } from '@/shared/schemas/calendar';
import { TourDetailsModal } from './TourDetailsModal';
import { TourRequestDialog } from './TourRequestDialog';
import { SimpleCalendar } from './SimpleCalendar';
import { CalendarAPI } from '@/services/CalendarAPI';

// Import react-big-calendar properly for modern React applications
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';

const localizer = momentLocalizer(moment);
const hasReactBigCalendar = true;

interface SharedCalendarProps {
  view?: 'month' | 'week' | 'day' | 'agenda';
  userType: 'user' | 'agent' | 'admin';
  agentId?: number;
  userId?: number;
  propertyId?: number;
  height?: number;
  onEventSelect?: (event: CalendarEvent) => void;
  onSlotSelect?: (slotInfo: { start: Date; end: Date }) => void;
}

export function SharedCalendar({
  view: defaultView = 'week',
  userType,
  agentId,
  userId,
  propertyId,
  height = 600,
  onEventSelect,
  onSlotSelect
}: SharedCalendarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentView, setCurrentView] = useState<View>(defaultView as View);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showTourRequest, setShowTourRequest] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Calculate date range for API query
  const dateRange = useMemo(() => {
    const start = moment(currentDate).startOf(currentView === 'month' ? 'month' : 'week').toDate();
    const end = moment(currentDate).endOf(currentView === 'month' ? 'month' : 'week').toDate();
    return { start, end };
  }, [currentDate, currentView]);

  // Fetch calendar events
  const { data: eventsData, isLoading, refetch } = useQuery({
    queryKey: ['calendar-events', dateRange, userType, agentId, userId],
    queryFn: () => CalendarAPI.getEvents({
      start: dateRange.start,
      end: dateRange.end,
      agentId,
      userId,
      view: userType === 'user' ? 'my_tours' : userType === 'agent' ? 'my_properties' : 'all'
    }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Real-time updates via SSE
  useEffect(() => {
    const eventSource = new EventSource('/api/calendar/events/stream');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type !== 'connected') {
        // Invalidate and refetch calendar data
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        
        // Show toast notification
        const messages = {
          tour_requested: 'New tour request received',
          tour_confirmed: 'Tour has been confirmed',
          tour_cancelled: 'Tour has been cancelled',
          tour_completed: 'Tour has been completed',
          tour_reschedule_requested: 'Reschedule request received'
        };
        
        const message = messages[data.type as keyof typeof messages] || 'Calendar updated';
        toast({
          title: 'Calendar Update',
          description: message,
        });
      }
    };

    return () => eventSource.close();
  }, [queryClient, toast]);

  const events = eventsData?.events || [];

  // Event style getter for color coding
  const eventStyleGetter = (event: CalendarEvent) => {
    const colors = {
      pending: { 
        backgroundColor: '#fbbf24', 
        borderColor: '#f59e0b',
        color: '#92400e'
      },
      confirmed: { 
        backgroundColor: '#10b981', 
        borderColor: '#059669',
        color: '#ffffff'
      },
      cancelled: { 
        backgroundColor: '#ef4444', 
        borderColor: '#dc2626',
        color: '#ffffff'
      },
      completed: { 
        backgroundColor: '#6b7280', 
        borderColor: '#4b5563',
        color: '#ffffff'
      },
      reschedule_requested: { 
        backgroundColor: '#f97316', 
        borderColor: '#ea580c',
        color: '#ffffff'
      },
      no_show: {
        backgroundColor: '#64748b',
        borderColor: '#475569',
        color: '#ffffff'
      }
    };
    
    return {
      style: colors[event.status] || colors.pending
    };
  };

  // Handle event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    onEventSelect?.(event);
  };

  // Handle slot selection (for creating new tours)
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (userType === 'user' && agentId) {
      setSelectedSlot(slotInfo);
      setShowTourRequest(true);
    }
    onSlotSelect?.(slotInfo);
  };

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div className="tour-event">
      <div className="flex items-center space-x-1">
        {event.isVirtual && <Video className="h-3 w-3" />}
        <span className="text-xs font-medium truncate">
          {event.property.title}
        </span>
      </div>
      <div className="text-xs opacity-90">
        {moment(event.start).format('h:mm A')}
      </div>
    </div>
  );

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="calendar-toolbar flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onNavigate('PREV')}
        >
          ←
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onNavigate('TODAY')}
        >
          Today
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onNavigate('NEXT')}
        >
          →
        </Button>
        <h3 className="text-lg font-semibold ml-4">{label}</h3>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
        
        <div className="flex border rounded-md">
          {(['month', 'week', 'day', 'agenda'] as View[]).map((viewName) => (
            <Button
              key={viewName}
              variant={currentView === viewName ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setCurrentView(viewName);
                onView(viewName);
              }}
              className="rounded-none first:rounded-l-md last:rounded-r-md"
            >
              {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  // Status legend
  const StatusLegend = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {[
        { status: 'pending', label: 'Pending', color: '#fbbf24' },
        { status: 'confirmed', label: 'Confirmed', color: '#10b981' },
        { status: 'cancelled', label: 'Cancelled', color: '#ef4444' },
        { status: 'completed', label: 'Completed', color: '#6b7280' },
        { status: 'reschedule_requested', label: 'Reschedule Requested', color: '#f97316' }
      ].map(({ status, label, color }) => (
        <div key={status} className="flex items-center space-x-1">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );

  // If react-big-calendar is not available, use SimpleCalendar
  if (!hasReactBigCalendar) {
    return (
      <SimpleCalendar
        userType={userType}
        agentId={agentId}
        userId={userId}
        propertyId={propertyId}
        onEventSelect={onEventSelect}
        onSlotSelect={onSlotSelect}
      />
    );
  }

  return (
    <div className="shared-calendar">
      <StatusLegend />
      
      <Card>
        <CardContent className="p-0">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable={userType === 'user' && !!agentId}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent,
              toolbar: CustomToolbar
            }}
            views={{
              month: true,
              week: true,
              day: true,
              agenda: true
            }}
            step={30}
            timeslots={2}
            min={new Date(0, 0, 0, 8, 0)} // 8 AM
            max={new Date(0, 0, 0, 20, 0)} // 8 PM
            style={{ height }}
            className="calendar-component"
            formats={{
              timeGutterFormat: 'h:mm A',
              eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                localizer?.format(start, 'h:mm A', culture) + ' – ' + 
                localizer?.format(end, 'h:mm A', culture),
              agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
                localizer?.format(start, 'h:mm A', culture) + ' – ' + 
                localizer?.format(end, 'h:mm A', culture),
            }}
          />
        </CardContent>
      </Card>

      {/* Tour Details Modal */}
      {selectedEvent && (
        <TourDetailsModal
          booking={selectedEvent}
          userType={userType}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Tour Request Dialog */}
      {showTourRequest && selectedSlot && agentId && propertyId && (
        <TourRequestDialog
          agentId={agentId}
          propertyId={propertyId}
          initialSlot={selectedSlot}
          isOpen={showTourRequest}
          onClose={() => {
            setShowTourRequest(false);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}

// Calendar Statistics Component
export function CalendarStats({ userType, agentId }: { 
  userType: 'user' | 'agent' | 'admin';
  agentId?: number;
}) {
  const { data: stats } = useQuery({
    queryKey: ['calendar-stats', userType, agentId],
    queryFn: () => CalendarAPI.getStats(agentId),
  });

  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tours Today</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.toursToday}</div>
          <p className="text-xs text-muted-foreground">
            {stats.pendingToday} pending confirmation
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.toursThisWeek}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.weekGrowth}% from last week
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <Check className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completionRate}%</div>
          <p className="text-xs text-muted-foreground">
            Of scheduled tours completed
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Tour</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-bold">
            {stats.nextTour ? moment(stats.nextTour.start).format('MMM DD, h:mm A') : 'None scheduled'}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.nextTour?.property?.title || 'No upcoming tours'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SharedCalendar;