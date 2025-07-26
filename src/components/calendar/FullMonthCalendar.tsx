import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfDay,
  endOfDay,
  addHours,
  isSameWeek
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin,
  User,
  Trash2,
  Edit2,
  Calendar as CalendarViewIcon,
  Columns,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Tour/Event interface for calendar display
 */
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: 'tour' | 'meeting' | 'appointment' | 'other';
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  clientName?: string;
  propertyTitle?: string;
  location?: string;
  notes?: string;
}

/**
 * Calendar view types
 */
export type CalendarView = 'month' | 'week' | 'day';

/**
 * Props for the FullMonthCalendar component
 */
interface FullMonthCalendarProps {
  events: CalendarEvent[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date) => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  view?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  className?: string;
}

/**
 * Full month calendar view component inspired by Google Calendar
 * Features:
 * - Complete month grid view
 * - Event display with colors and badges
 * - Month navigation controls
 * - Click handlers for dates and events
 * - Responsive design that adapts to screen size
 */
export function FullMonthCalendar({
  events = [],
  selectedDate,
  onDateSelect,
  onEventClick,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  view = 'month',
  onViewChange,
  className
}: FullMonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  /**
   * Generate calendar grid based on current view
   * Returns array of dates for month, week, or single day
   */
  const calendarDays = useMemo(() => {
    if (view === 'day') {
      return [new Date(selectedDate || currentMonth)];
    } else if (view === 'week') {
      const weekStart = startOfWeek(selectedDate || currentMonth);
      const days = [];
      for (let i = 0; i < 7; i++) {
        days.push(addDays(weekStart, i));
      }
      return days;
    } else {
      // Month view
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const startDate = startOfWeek(monthStart);
      const endDate = endOfWeek(monthEnd);

      const days = [];
      let day = startDate;

      while (day <= endDate) {
        days.push(new Date(day));
        day = addDays(day, 1);
      }

      return days;
    }
  }, [currentMonth, selectedDate, view]);

  /**
   * Get events for a specific date
   */
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => isSameDay(event.date, date));
  };

  /**
   * Handle navigation based on current view
   */
  const navigateToPrevious = () => {
    if (view === 'day') {
      setCurrentMonth(prev => addDays(prev, -1));
      onDateSelect?.(addDays(selectedDate || currentMonth, -1));
    } else if (view === 'week') {
      setCurrentMonth(prev => addWeeks(prev, -1));
      onDateSelect?.(addWeeks(selectedDate || currentMonth, -1));
    } else {
      setCurrentMonth(prev => subMonths(prev, 1));
    }
  };

  const navigateToNext = () => {
    if (view === 'day') {
      setCurrentMonth(prev => addDays(prev, 1));
      onDateSelect?.(addDays(selectedDate || currentMonth, 1));
    } else if (view === 'week') {
      setCurrentMonth(prev => addWeeks(prev, 1));
      onDateSelect?.(addWeeks(selectedDate || currentMonth, 1));
    } else {
      setCurrentMonth(prev => addMonths(prev, 1));
    }
  };

  const navigateToToday = () => {
    console.log('Today button clicked');
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect?.(today);
  };

  /**
   * Get status color classes for events
   */
  const getEventStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * Get event type icon and colors
   */
  const getEventTypeStyles = (type: string) => {
    switch (type) {
      case 'tour':
        return { icon: MapPin, color: 'text-blue-600' };
      case 'meeting':
        return { icon: User, color: 'text-purple-600' };
      case 'appointment':
        return { icon: Clock, color: 'text-green-600' };
      default:
        return { icon: Clock, color: 'text-gray-600' };
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      {/* Calendar Header with Navigation */}
      <CardHeader className="bg-black text-white space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {view === 'day' 
              ? format(selectedDate || currentMonth, 'EEEE, MMMM d, yyyy')
              : view === 'week'
              ? `Week of ${format(startOfWeek(selectedDate || currentMonth), 'MMMM d, yyyy')}`
              : format(currentMonth, 'MMMM yyyy')
            }
          </CardTitle>
          
          {/* View Toggle Buttons */}
          {onViewChange && (
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-2 border-2 border-gray-600">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('Month view clicked');
                  onViewChange('month');
                }}
                className="font-bold text-sm px-3 py-2"
                style={{
                  backgroundColor: view === 'month' ? '#F59E0B' : '#4B5563',
                  color: 'white',
                  border: view === 'month' ? '2px solid #D97706' : '2px solid #6B7280',
                  borderRadius: '6px',
                  minHeight: '36px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                <CalendarViewIcon className="h-4 w-4 mr-1" />
                MONTH
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('Week view clicked');
                  onViewChange('week');
                }}
                className="font-bold text-sm px-3 py-2"
                style={{
                  backgroundColor: view === 'week' ? '#F59E0B' : '#4B5563',
                  color: 'white',
                  border: view === 'week' ? '2px solid #D97706' : '2px solid #6B7280',
                  borderRadius: '6px',
                  minHeight: '36px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                <Columns className="h-4 w-4 mr-1" />
                WEEK
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('Day view clicked');
                  onViewChange('day');
                }}
                className="font-bold text-sm px-3 py-2"
                style={{
                  backgroundColor: view === 'day' ? '#F59E0B' : '#4B5563',
                  color: 'white',
                  border: view === 'day' ? '2px solid #D97706' : '2px solid #6B7280',
                  borderRadius: '6px',
                  minHeight: '36px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                <Square className="h-4 w-4 mr-1" />
                DAY
              </Button>
            </div>
          )}
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToToday}
              className="font-bold text-sm px-4 py-2"
              style={{ 
                backgroundColor: '#3B82F6',
                color: 'white',
                border: '2px solid #1E40AF',
                borderRadius: '6px',
                minHeight: '36px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              TODAY
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToPrevious}
              className="p-2"
              style={{
                backgroundColor: '#6B7280',
                color: 'white',
                border: '2px solid #374151',
                borderRadius: '6px',
                width: '40px',
                height: '36px',
                minHeight: '36px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToNext}
              className="p-2"
              style={{
                backgroundColor: '#6B7280',
                color: 'white',
                border: '2px solid #374151',
                borderRadius: '6px',
                width: '40px',
                height: '36px',
                minHeight: '36px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Add Event Button */}
        {onAddEvent && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Add Event button clicked');
                onAddEvent(selectedDate || new Date());
              }}
              className="font-bold text-sm px-4 py-2"
              style={{ 
                backgroundColor: '#10B981',
                color: 'white',
                border: '2px solid #047857',
                borderRadius: '6px',
                minHeight: '36px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              ADD EVENT
            </Button>
          </div>
        )}

        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="h-10 flex items-center justify-center text-sm font-medium text-gray-300"
            >
              {day}
            </div>
          ))}
        </div>
      </CardHeader>

      {/* Calendar Grid */}
      <CardContent className="p-0">
        {view === 'day' ? (
          <DayView 
            date={selectedDate || currentMonth}
            events={getEventsForDate(selectedDate || currentMonth)}
            onEventClick={onEventClick}
            onAddEvent={onAddEvent}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
          />
        ) : view === 'week' ? (
          <WeekView 
            weekStart={startOfWeek(selectedDate || currentMonth)}
            events={events}
            onDateSelect={onDateSelect}
            onEventClick={onEventClick}
            onAddEvent={onAddEvent}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
            selectedDate={selectedDate}
          />
        ) : (
          <div className="grid grid-cols-7 border-l border-t border-gray-200">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[120px] border-r border-b border-gray-200 p-1 bg-white hover:bg-gray-50 cursor-pointer transition-colors",
                    !isCurrentMonth && "bg-gray-50 text-gray-400",
                    isSelected && "bg-blue-50 ring-2 ring-blue-500 ring-inset",
                    isTodayDate && "bg-blue-50"
                  )}
                  onClick={() => onDateSelect?.(day)}
                >
                {/* Date Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                      isTodayDate && "bg-blue-600 text-white",
                      isSelected && !isTodayDate && "bg-blue-500 text-white",
                      !isCurrentMonth && "text-gray-400"
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  
                  {/* Quick Add Button (on hover) */}
                  {onAddEvent && isCurrentMonth && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 h-5 w-5 p-0 hover:bg-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddEvent(day);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Events List */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => {
                    const { icon: Icon, color } = getEventTypeStyles(event.type);
                    
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "relative group text-xs p-1 rounded border cursor-pointer hover:shadow-sm transition-shadow",
                          getEventStatusColor(event.status)
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        <div className="flex items-center gap-1 min-w-0">
                          <Icon className={cn("h-3 w-3 flex-shrink-0", color)} />
                          <span className="truncate font-medium">
                            {event.time && (
                              <span className="mr-1">{event.time}</span>
                            )}
                            {event.title}
                          </span>
                        </div>
                        
                        {/* Event Actions (on hover) */}
                        <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 flex gap-1">
                          {onEditEvent && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-white/80"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditEvent(event);
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                          {onDeleteEvent && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-red-100 text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteEvent(event.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        {/* Additional event details on hover */}
                        {event.clientName && (
                          <div className="text-xs text-gray-600 truncate">
                            {event.clientName}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Show "+N more" if there are more than 3 events */}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium pl-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Hook for managing calendar state and events
 * Provides common calendar operations and state management
 */
export function useCalendarState(initialEvents: CalendarEvent[] = []) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2)}`
    };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const updateEvent = (eventId: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ));
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const getUpcomingEvents = (days: number = 7) => {
    const now = new Date();
    const futureDate = addDays(now, days);
    return events
      .filter(event => event.date >= now && event.date <= futureDate)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  return {
    events,
    selectedDate,
    setSelectedDate,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getUpcomingEvents,
    setEvents
  };
}

/**
 * Day View Component - Shows a single day with hourly time slots
 */
function DayView({ 
  date, 
  events, 
  onEventClick, 
  onAddEvent, 
  onEditEvent, 
  onDeleteEvent 
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date) => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="h-[600px] overflow-y-auto">
      {hours.map(hour => {
        const hourDate = new Date(date);
        hourDate.setHours(hour, 0, 0, 0);
        const hourEvents = events.filter(event => 
          event.date.getHours() === hour || (event.time && event.time.startsWith(String(hour).padStart(2, '0')))
        );

        return (
          <div 
            key={hour}
            className="border-b border-gray-200 min-h-[60px] flex"
          >
            {/* Time column */}
            <div className="w-20 p-2 text-sm text-gray-500 border-r border-gray-200">
              {format(hourDate, 'h:mm a')}
            </div>
            
            {/* Events column */}
            <div 
              className="flex-1 p-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                const newDate = new Date(date);
                newDate.setHours(hour, 0, 0, 0);
                onAddEvent?.(newDate);
              }}
            >
              <div className="space-y-1">
                {hourEvents.map(event => {
                  const { icon: Icon, color } = getEventTypeStyles(event.type);
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "p-2 rounded border text-sm cursor-pointer hover:shadow-sm",
                        getEventStatusColor(event.status)
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", color)} />
                        <span className="font-medium">{event.title}</span>
                      </div>
                      {event.clientName && (
                        <div className="text-xs text-gray-600 mt-1">
                          {event.clientName}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Week View Component - Shows 7 days in columns
 */
function WeekView({ 
  weekStart, 
  events, 
  onDateSelect, 
  onEventClick, 
  onAddEvent, 
  onEditEvent, 
  onDeleteEvent, 
  selectedDate 
}: {
  weekStart: Date;
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date) => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  selectedDate?: Date;
}) {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div>
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map(day => (
          <div
            key={day.toISOString()}
            className="p-4 text-center border-r border-gray-200 last:border-r-0"
          >
            <div className="text-sm text-gray-500">
              {format(day, 'EEE')}
            </div>
            <div 
              className={cn(
                "text-lg font-medium cursor-pointer hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto",
                isToday(day) && "bg-blue-600 text-white hover:bg-blue-700",
                selectedDate && isSameDay(day, selectedDate) && !isToday(day) && "bg-blue-100 text-blue-600"
              )}
              onClick={() => onDateSelect?.(day)}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 h-[500px]">
        {weekDays.map(day => {
          const dayEvents = events.filter(event => isSameDay(event.date, day));
          
          return (
            <div
              key={day.toISOString()}
              className="border-r border-gray-200 last:border-r-0 p-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => onAddEvent?.(day)}
            >
              <div className="space-y-1">
                {dayEvents.map(event => {
                  const { icon: Icon, color } = getEventTypeStyles(event.type);
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "p-1 rounded text-xs cursor-pointer border",
                        getEventStatusColor(event.status)
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <Icon className={cn("h-3 w-3", color)} />
                        <span className="truncate">
                          {event.time && <span className="mr-1">{event.time}</span>}
                          {event.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}