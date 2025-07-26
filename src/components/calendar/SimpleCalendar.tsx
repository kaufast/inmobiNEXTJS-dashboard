import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday, isSameMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Video,
  RefreshCw
} from 'lucide-react';
import { CalendarEvent } from '@/shared/schemas/calendar';
import { TourDetailsModal } from './TourDetailsModal';
import { TourRequestDialog } from './TourRequestDialog';
import { CalendarAPI } from '@/services/CalendarAPI';
import { useToast } from '@/hooks/use-toast';

interface SimpleCalendarProps {
  userType: 'user' | 'agent' | 'admin';
  agentId?: number;
  userId?: number;
  propertyId?: number;
  onEventSelect?: (event: CalendarEvent) => void;
  onSlotSelect?: (slotInfo: { start: Date; end: Date }) => void;
}

export function SimpleCalendar({
  userType,
  agentId,
  userId,
  propertyId,
  onEventSelect,
  onSlotSelect
}: SimpleCalendarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showTourRequest, setShowTourRequest] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Fetch calendar events
  const { data: eventsData, isLoading, refetch } = useQuery({
    queryKey: ['calendar-events', monthStart, monthEnd, userType, agentId, userId],
    queryFn: () => CalendarAPI.getEvents({
      start: monthStart,
      end: monthEnd,
      agentId,
      userId,
      view: userType === 'user' ? 'my_tours' : userType === 'agent' ? 'my_properties' : 'all'
    }),
    refetchInterval: 30000,
  });

  // Real-time updates via SSE
  useEffect(() => {
    const eventSource = new EventSource('/api/calendar/events/stream');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type !== 'connected') {
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        
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

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.start), day));
  };

  // Handle day click
  const handleDayClick = (day: Date) => {
    if (userType === 'user' && agentId && propertyId) {
      const slotStart = new Date(day);
      slotStart.setHours(9, 0, 0, 0); // Default to 9 AM
      const slotEnd = new Date(day);
      slotEnd.setHours(10, 0, 0, 0); // 1 hour duration
      
      setSelectedSlot({ start: slotStart, end: slotEnd });
      setShowTourRequest(true);
    }
    onSlotSelect?.({ start: day, end: day });
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    onEventSelect?.(event);
  };

  // Navigation
  const goToPrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Status colors
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
    <div className="simple-calendar space-y-4">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>{format(currentDate, 'MMMM yyyy')}</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <div className="flex space-x-1">
                <Button variant="outline" size="sm" onClick={goToPrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map(day => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[100px] p-1 border border-border cursor-pointer hover:bg-muted/50 transition-colors
                    ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''}
                    ${isDayToday ? 'bg-primary/10 border-primary' : ''}
                  `}
                  onClick={() => handleDayClick(day)}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${isDayToday ? 'text-primary font-bold' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Events for the day */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`
                          text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity
                          ${getStatusColor(event.status)}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        <div className="flex items-center space-x-1 truncate">
                          {event.isVirtual && <Video className="h-2 w-2 flex-shrink-0" />}
                          <span className="truncate">
                            {format(new Date(event.start), 'HH:mm')} - {event.title}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <h4 className="text-sm font-medium text-muted-foreground w-full mb-2">Status Legend:</h4>
            {[
              { status: 'pending', label: 'Pending', color: '#fbbf24' },
              { status: 'confirmed', label: 'Confirmed', color: '#10b981' },
              { status: 'cancelled', label: 'Cancelled', color: '#ef4444' },
              { status: 'completed', label: 'Completed', color: '#6b7280' },
              { status: 'reschedule_requested', label: 'Reschedule Requested', color: '#f97316' }
            ].map(({ status, label, color }) => (
              <div key={status} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
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

export default SimpleCalendar;