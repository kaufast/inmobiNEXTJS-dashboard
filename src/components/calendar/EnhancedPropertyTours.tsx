import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, isSameDay } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar as CalendarIcon, Eye, Plus, Users, MapPin, Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FullMonthCalendar, CalendarEvent, useCalendarState, CalendarView } from './FullMonthCalendar';
import { EventFormDialog } from './EventFormDialog';

// Legacy Tour interface for compatibility
interface Tour {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  propertyAddress: string;
}

// Mock tour data (same as original component)
const MOCK_TOURS: Tour[] = [
  {
    id: "tour-1",
    propertyId: "prop-1",
    propertyTitle: "Luxury Apartment in Downtown",
    propertyImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2670&auto=format&fit=crop",
    clientName: "Alice Johnson",
    clientEmail: "alice@example.com",
    clientPhone: "+1 (555) 123-4567",
    date: new Date(new Date().getTime() + 86400000),
    status: "pending",
    notes: "Interested in checking the view from the balcony and nearby amenities.",
    propertyAddress: "123 Main St, Downtown"
  },
  {
    id: "tour-2",
    propertyId: "prop-2",
    propertyTitle: "Modern Villa with Pool",
    propertyImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
    clientName: "Bob Smith",
    clientEmail: "bob@example.com",
    clientPhone: "+1 (555) 987-6543",
    date: new Date(new Date().getTime() + 172800000),
    status: "confirmed",
    notes: "Would like to see pool maintenance details and check the garden area.",
    propertyAddress: "456 Palm Ave, Westside"
  },
  {
    id: "tour-3",
    propertyId: "prop-3",
    propertyTitle: "Cozy Studio in Historic District",
    propertyImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2670&auto=format&fit=crop",
    clientName: "Carol Davis",
    clientEmail: "carol@example.com",
    clientPhone: "+1 (555) 456-7890",
    date: new Date(new Date().getTime() - 86400000),
    status: "completed",
    notes: "Very interested in the property, especially the original wood floors.",
    propertyAddress: "789 Heritage Ln, Historic District"
  },
  {
    id: "tour-4",
    propertyId: "prop-4",
    propertyTitle: "Penthouse with Ocean Views",
    propertyImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2680&auto=format&fit=crop",
    clientName: "David Wilson",
    clientEmail: "david@example.com",
    clientPhone: "+1 (555) 321-0987",
    date: new Date(new Date().getTime() - 172800000),
    status: "cancelled",
    notes: "Had to cancel due to an unexpected business trip.",
    propertyAddress: "101 Ocean Dr, Beachfront"
  }
];

/**
 * Enhanced Property Tours component with full month calendar view
 * Integrates the existing tour functionality with the new calendar interface
 */
export function EnhancedPropertyTours() {
  const { t } = useTranslation('properties');
  const { toast } = useToast();
  
  // Legacy tours state
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'calendar' | 'list'>('calendar');
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  
  // Calendar state
  const {
    events,
    selectedDate,
    setSelectedDate,
    addEvent,
    updateEvent,
    deleteEvent,
    setEvents
  } = useCalendarState();
  
  // Dialog states
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  /**
   * Convert Tour to CalendarEvent format
   */
  const convertTourToEvent = (tour: Tour): CalendarEvent => {
    return {
      id: tour.id,
      title: tour.propertyTitle,
      date: tour.date,
      time: format(tour.date, 'HH:mm'),
      type: 'tour',
      status: tour.status,
      clientName: tour.clientName,
      propertyTitle: tour.propertyTitle,
      location: tour.propertyAddress,
      notes: tour.notes
    };
  };

  /**
   * Load tours and convert to calendar events
   */
  useEffect(() => {
    const fetchTours = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTours(MOCK_TOURS);
        
        // Convert tours to calendar events
        const calendarEvents = MOCK_TOURS.map(convertTourToEvent);
        setEvents(calendarEvents);
      } catch (error) {
        console.error("Failed to fetch tours:", error);
        toast({
          title: 'Error',
          description: 'Failed to load tours',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTours();
  }, [setEvents, toast]);

  /**
   * Handle adding a new event
   */
  const handleAddEvent = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setEventFormOpen(true);
  };

  /**
   * Handle editing an existing event
   */
  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventFormOpen(true);
  };

  /**
   * Handle event click for details view
   */
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDetailsOpen(true);
  };

  /**
   * Handle saving event (create or update)
   */
  const handleSaveEvent = async (eventData: any) => {
    setFormLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingEvent) {
        // Update existing event
        updateEvent(editingEvent.id, eventData);
        toast({
          title: 'Event Updated',
          description: 'The event has been updated successfully.',
        });
      } else {
        // Create new event
        const newEvent = addEvent(eventData);
        toast({
          title: 'Event Created',
          description: 'The new event has been created successfully.',
        });
      }
      
      setEventFormOpen(false);
      setEditingEvent(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Handle deleting an event
   */
  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteConfirmOpen(true);
  };

  /**
   * Confirm event deletion
   */
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      deleteEvent(eventToDelete);
      
      toast({
        title: 'Event Deleted',
        description: 'The event has been deleted successfully.',
      });
      
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
      setEventDetailsOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Get status badge component
   */
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="border-green-500 text-green-700">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="border-red-500 text-red-700">Cancelled</Badge>;
      default:
        return null;
    }
  };

  /**
   * Get events for selected date
   */
  const selectedDateEvents = selectedDate 
    ? events.filter(event => isSameDay(event.date, selectedDate))
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
        <span className="text-gray-500">Loading tours...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Property Tours Calendar</h2>
          <p className="text-muted-foreground">
            Manage your property tours and appointments in a visual calendar format
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleAddEvent(selectedDate || new Date())}
            className="border-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
          
          <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
            <TabsList>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Tabs value={activeView} className="w-full">
        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Full Month Calendar */}
            <div className="lg:col-span-3">
              <FullMonthCalendar
                events={events}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onEventClick={handleEventClick}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                view={calendarView}
                onViewChange={setCalendarView}
              />
            </div>

            {/* Selected Date Events Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-black">
                <CardHeader className="bg-black text-white">
                  <CardTitle className="text-lg">
                    {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a Date'}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{event.title}</p>
                              {event.time && (
                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {event.time}
                                </p>
                              )}
                              {event.clientName && (
                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                  <Users className="h-3 w-3 mr-1" />
                                  {event.clientName}
                                </p>
                              )}
                              {event.location && (
                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {event.location}
                                </p>
                              )}
                            </div>
                            <div className="ml-2">
                              {getStatusBadge(event.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {selectedDate ? 'No events on this date' : 'Select a date to view events'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* List View (Original Component) */}
        <TabsContent value="list">
          <div className="text-center py-8 text-gray-500">
            <p>List view would show the original table format here.</p>
            <p className="text-sm">This maintains compatibility with the existing tours component.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Form Dialog */}
      <EventFormDialog
        open={eventFormOpen}
        onOpenChange={setEventFormOpen}
        event={editingEvent}
        initialDate={selectedDate}
        onSave={handleSaveEvent}
        onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : undefined}
        isLoading={formLoading}
      />

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={eventDetailsOpen} onOpenChange={setEventDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Event Details</DialogTitle>
              <DialogDescription>
                View and manage this calendar event
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-500">
                  {format(selectedEvent.date, 'MMMM d, yyyy')} at {selectedEvent.time}
                </p>
              </div>

              {selectedEvent.clientName && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Client</p>
                  <p>{selectedEvent.clientName}</p>
                </div>
              )}

              {selectedEvent.location && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedEvent.location}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                {getStatusBadge(selectedEvent.status)}
              </div>

              {selectedEvent.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedEvent.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => handleDeleteEvent(selectedEvent.id)}
              >
                Delete
              </Button>
              <Button
                onClick={() => handleEditEvent(selectedEvent)}
                className="bg-black text-white hover:bg-gray-800"
              >
                Edit Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEvent}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}