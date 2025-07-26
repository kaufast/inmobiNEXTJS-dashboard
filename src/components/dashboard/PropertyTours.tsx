import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Calendar as CalendarIcon, Check, X, Phone, Mail, Eye, MapPin, Edit2, Trash2, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FullMonthCalendar, CalendarEvent, useCalendarState } from "../calendar/FullMonthCalendar";

// Mock data for fallback during development
const createMockTour = (id: number): Tour => ({
  id,
  propertyId: 1,
  userId: 1,
  agentId: 1,
  scheduledDate: new Date(new Date().getTime() + 86400000),
  endTime: new Date(new Date().getTime() + 86400000 + 3600000),
  status: "pending",
  notes: "Mock tour data for development",
  property: {
    id: 1,
    title: `Mock Property ${id}`,
    address: "123 Mock St, Test City",
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2670&auto=format&fit=crop"]
  },
  user: {
    id: 1,
    fullName: "Test Client",
    email: "test@example.com",
    phone: "+1 (555) 123-4567"
  }
});

const MOCK_TOURS: Tour[] = [
  createMockTour(1),
  createMockTour(2),
  createMockTour(3)
];

type TourStatus = "pending" | "confirmed" | "completed" | "canceled";

interface Tour {
  id: number;
  propertyId: number;
  userId: number;
  agentId: number;
  scheduledDate: Date;
  endTime: Date;
  status: TourStatus;
  notes?: string;
  property?: {
    id: number;
    title: string;
    address: string;
    images?: string[];
  };
  user?: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
  };
}

export function PropertyTours() {
  const { t } = useTranslation('properties');
  const { toast } = useToast();
  const { user } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editTime, setEditTime] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calendar state for the big calendar
  const {
    events,
    setEvents,
    selectedDate: calendarSelectedDate,
    setSelectedDate: setCalendarSelectedDate,
  } = useCalendarState();

  // Convert Tour to CalendarEvent format
  const convertTourToEvent = (tour: Tour): CalendarEvent => {
    return {
      id: tour.id.toString(),
      title: tour.property?.title || 'Property Tour',
      date: new Date(tour.scheduledDate),
      time: format(new Date(tour.scheduledDate), 'HH:mm'),
      type: 'tour',
      status: tour.status,
      clientName: tour.user?.fullName || 'Unknown Client',
      propertyTitle: tour.property?.title || 'Property Tour',
      location: tour.property?.address || 'Location TBD',
      notes: tour.notes
    };
  };

  useEffect(() => {
    const fetchTours = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Determine endpoint based on user role
        const endpoint = user.role === 'agent' 
          ? `/api/property-tours/agent/${user.id}`
          : `/api/property-tours/user/${user.id}`;
        
        const response = await fetch(endpoint, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch tours');
        }
        
        const toursData = await response.json();
        
        // Convert API dates to Date objects
        const processedTours = toursData.map((tour: any) => ({
          ...tour,
          scheduledDate: new Date(tour.scheduledDate),
          endTime: new Date(tour.endTime)
        }));
        
        setTours(processedTours);
        
        // Convert tours to calendar events for the big calendar
        const calendarEvents = processedTours.map(convertTourToEvent);
        setEvents(calendarEvents);
      } catch (error) {
        console.error("Failed to fetch tours:", error);
        toast({
          title: "Error",
          description: "Failed to load tours. Please try again.",
          variant: "destructive",
        });
        
        // Fallback to mock data for development
        setTours(MOCK_TOURS);
        const calendarEvents = MOCK_TOURS.map(convertTourToEvent);
        setEvents(calendarEvents);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTours();
  }, [user, toast, setEvents]);

  const updateTourStatus = async (tourId: number, newStatus: TourStatus) => {
    try {
      const response = await fetch(`/api/property-tours/${tourId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tour status');
      }

      const updatedTour = await response.json();
      
      // Update tour in local state
      setTours(prevTours => 
        prevTours.map(tour => 
          tour.id === tourId ? { 
            ...tour, 
            status: newStatus,
            scheduledDate: new Date(updatedTour.scheduledDate),
            endTime: new Date(updatedTour.endTime)
          } : tour
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Tour status has been updated to ${newStatus}.`,
      });
      
      setUpdateDialogOpen(false);
    } catch (error) {
      console.error('Error updating tour status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update tour status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateTourDateTime = async () => {
    if (!selectedTour || !editDate || !editTime) return;
    
    setIsUpdating(true);
    try {
      // Create new date with time
      const [hours, minutes] = editTime.split(':');
      const newDateTime = new Date(editDate);
      newDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      // Calculate end time (assuming 1 hour duration)
      const endDateTime = new Date(newDateTime);
      endDateTime.setHours(endDateTime.getHours() + 1);
      
      const response = await fetch(`/api/property-tours/${selectedTour.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          scheduledDate: newDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          notes: editNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tour');
      }

      const updatedTour = await response.json();
      
      // Update tour in local state
      setTours(prevTours => 
        prevTours.map(tour => 
          tour.id === selectedTour.id 
            ? { 
                ...tour, 
                scheduledDate: new Date(updatedTour.scheduledDate),
                endTime: new Date(updatedTour.endTime),
                notes: updatedTour.notes 
              }
            : tour
        )
      );
      
      // Update calendar events
      const updatedCalendarEvents = tours.map(tour =>
        tour.id === selectedTour.id 
          ? convertTourToEvent({
              ...tour,
              scheduledDate: new Date(updatedTour.scheduledDate),
              endTime: new Date(updatedTour.endTime),
              notes: updatedTour.notes
            })
          : convertTourToEvent(tour)
      );
      setEvents(updatedCalendarEvents);
      
      toast({
        title: "Tour Updated",
        description: "Tour date, time, and notes have been updated successfully.",
      });
      
      setEditDialogOpen(false);
      setSelectedTour(null);
    } catch (error) {
      console.error('Error updating tour:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update tour. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteTour = async () => {
    if (!selectedTour) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/property-tours/${selectedTour.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tour');
      }
      
      // Remove tour from local state
      setTours(prevTours => prevTours.filter(tour => tour.id !== selectedTour.id));
      
      // Update calendar events
      const updatedCalendarEvents = events.filter(event => event.id !== selectedTour.id.toString());
      setEvents(updatedCalendarEvents);
      
      toast({
        title: "Tour Deleted",
        description: "The tour has been deleted successfully.",
      });
      
      setDeleteDialogOpen(false);
      setSelectedTour(null);
    } catch (error) {
      console.error('Error deleting tour:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete tour. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (tour: Tour) => {
    setSelectedTour(tour);
    setEditDate(new Date(tour.scheduledDate));
    setEditTime(format(new Date(tour.scheduledDate), "HH:mm"));
    setEditNotes(tour.notes || "");
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (tour: Tour) => {
    setSelectedTour(tour);
    setDeleteDialogOpen(true);
  };

  // Filter tours based on active tab
  const filteredTours = tours.filter(tour => {
    const now = new Date();
    const tourDate = new Date(tour.scheduledDate);
    
    if (selectedDate) {
      const selectedDay = selectedDate.setHours(0, 0, 0, 0);
      const tourDay = new Date(tourDate).setHours(0, 0, 0, 0);
      if (selectedDay !== tourDay) return false;
    }
    
    switch (activeTab) {
      case "upcoming":
        return tourDate >= now && (tour.status === "pending" || tour.status === "confirmed");
      case "past":
        return tourDate < now || tour.status === "completed" || tour.status === "canceled";
      case "all":
        return true;
      default:
        return false;
    }
  });

  // Get dates with tours for calendar highlighting
  const datesWithTours = tours.map(tour => new Date(tour.scheduledDate));

  const getStatusBadge = (status: TourStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="border-green-500 text-green-700">Confirmed</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Completed</Badge>;
      case "canceled":
        return <Badge variant="outline" className="border-red-500 text-red-700">Canceled</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar Card */}
        <Card className="md:w-1/3 border-black">
          <CardHeader className="bg-black text-white">
            <CardTitle>{t('tours.calendar.title')}</CardTitle>
            <CardDescription className="text-gray-300">
              {t('tours.calendar.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="border-none"
              modifiers={{
                hasEvent: datesWithTours,
              }}
              modifiersStyles={{
                hasEvent: {
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '50%'
                }
              }}
            />
          </CardContent>
          <CardFooter className="bg-gray-50 p-4">
            <Button 
              variant="outline"
              onClick={() => setSelectedDate(undefined)}
              className="border-black text-black w-full"
            >
              {t('tours.calendar.clearSelection')}
            </Button>
          </CardFooter>
        </Card>

        {/* Tours List */}
        <Card className="flex-1 border-black">
          <CardHeader className="bg-black text-white">
            <CardTitle>{t('tours.title')}</CardTitle>
            <CardDescription className="text-gray-300">
              {t('tours.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 rounded-none bg-gray-100">
                <TabsTrigger value="upcoming">{t('tours.tabs.upcoming')}</TabsTrigger>
                <TabsTrigger value="past">{t('tours.tabs.past')}</TabsTrigger>
                <TabsTrigger value="all">{t('tours.tabs.all')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="m-0">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
                    <span className="text-gray-500">{t('tours.loading')}</span>
                  </div>
                ) : filteredTours.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">{t('tours.table.property')}</TableHead>
                          <TableHead>{t('tours.table.client')}</TableHead>
                          <TableHead>{t('tours.table.dateTime')}</TableHead>
                          <TableHead>{t('tours.table.status')}</TableHead>
                          <TableHead className="text-right">{t('tours.table.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTours.map((tour) => (
                          <TableRow key={tour.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                {tour.property?.images?.[0] && (
                                  <img 
                                    src={tour.property.images[0]} 
                                    alt={tour.property?.title || 'Property'} 
                                    className="h-10 w-10 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{tour.property?.title || 'Property Tour'}</p>
                                  <p className="text-xs text-gray-500 flex items-center mt-1">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {tour.property?.address || 'Location TBD'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p>{tour.user?.fullName || 'Unknown Client'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <a 
                                    href={`mailto:${tour.user?.email || ''}`} 
                                    className="text-xs text-gray-500 flex items-center"
                                  >
                                    <Mail className="h-3 w-3 mr-1" />
                                    {tour.user?.email || 'No email'}
                                  </a>
                                  {tour.user?.phone && (
                                    <a 
                                      href={`tel:${tour.user.phone}`} 
                                      className="text-xs text-gray-500 flex items-center"
                                    >
                                      <Phone className="h-3 w-3 mr-1" />
                                      {tour.user.phone}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {format(new Date(tour.scheduledDate), "MMM d, yyyy")}
                              <br />
                              <span className="text-gray-500">
                                {format(new Date(tour.scheduledDate), "h:mm a")}
                              </span>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(tour.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-black h-8 w-8 p-0"
                                  onClick={() => setSelectedTour(tour)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-black h-8 w-8 p-0"
                                  onClick={() => openEditDialog(tour)}
                                  title="Edit Date/Time"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-black h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedTour(tour);
                                    setUpdateDialogOpen(true);
                                  }}
                                  title="Update Status"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                  onClick={() => openDeleteDialog(tour)}
                                  title="Delete Tour"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : selectedDate ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <CalendarIcon className="h-10 w-10 text-gray-400 mb-3" />
                    <h3 className="font-medium text-gray-900">{t('tours.empty.noToursOnDate')}</h3>
                    <p className="text-gray-500">
                      {t('tours.empty.noToursOnDateDescription', { date: format(selectedDate, "MMMM d, yyyy") })}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <CalendarIcon className="h-10 w-10 text-gray-400 mb-3" />
                    <h3 className="font-medium text-gray-900">{t('tours.empty.noToursFound')}</h3>
                    <p className="text-gray-500">
                      {activeTab === "upcoming" 
                        ? t('tours.empty.noUpcomingTours')
                        : activeTab === "past"
                        ? t('tours.empty.noPastTours')
                        : t('tours.empty.noTours')}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Tour Details Dialog */}
      {selectedTour && (
        <Dialog open={Boolean(selectedTour) && !updateDialogOpen} onOpenChange={(open: boolean) => !open && setSelectedTour(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('tours.dialog.tourDetails')}</DialogTitle>
              <DialogDescription>
                {t('tours.dialog.tourDetailsDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {selectedTour.property?.images?.[0] && (
                  <img 
                    src={selectedTour.property.images[0]} 
                    alt={selectedTour.property?.title || 'Property'} 
                    className="h-16 w-16 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-medium">{selectedTour.property?.title || 'Property Tour'}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedTour.property?.address || 'Location TBD'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p>{format(new Date(selectedTour.scheduledDate), "MMMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Time</p>
                    <p>{format(new Date(selectedTour.scheduledDate), "h:mm a")}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Client</p>
                <div className="border rounded-md p-3">
                  <p className="font-medium">{selectedTour.user?.fullName || 'Unknown Client'}</p>
                  <a 
                    href={`mailto:${selectedTour.user?.email || ''}`} 
                    className="text-sm text-gray-500 flex items-center mt-1"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    {selectedTour.user?.email || 'No email'}
                  </a>
                  {selectedTour.user?.phone && (
                    <a 
                      href={`tel:${selectedTour.user.phone}`} 
                      className="text-sm text-gray-500 flex items-center mt-1"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {selectedTour.user.phone}
                    </a>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">{t('tours.dialog.status')}</p>
                <div>
                  {getStatusBadge(selectedTour.status)}
                </div>
              </div>
              
              {selectedTour.notes && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">{t('tours.dialog.notes')}</p>
                  <div className="border rounded-md p-3 text-sm">
                    {selectedTour.notes}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4 flex justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="border-black"
                  onClick={() => openEditDialog(selectedTour)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  className="border-black"
                  onClick={() => setUpdateDialogOpen(true)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
              </div>
              <Button 
                variant="outline" 
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => openDeleteDialog(selectedTour)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Update Status Dialog */}
      {selectedTour && (
        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle>{t('tours.dialog.updateTourStatus')}</DialogTitle>
              <DialogDescription>
                {t('tours.dialog.updateTourStatusDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <Select
                defaultValue={selectedTour.status}
                onValueChange={(value: string) => updateTourStatus(selectedTour.id, value as TourStatus)}
              >
                <SelectTrigger className="border-black focus:border-black focus:ring-black">
                  <SelectValue placeholder={t('tours.dialog.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-4">
              <Button 
                variant="outline" 
                className="border-black"
                onClick={() => setUpdateDialogOpen(false)}
              >
                {t('tours.buttons.cancel')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Tour Dialog */}
      {selectedTour && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Tour</DialogTitle>
              <DialogDescription>
                Update the date, time, and notes for this property tour
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Property Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {selectedTour.property?.images?.[0] && (
                  <img 
                    src={selectedTour.property.images[0]} 
                    alt={selectedTour.property?.title || 'Property'} 
                    className="h-12 w-12 object-cover rounded"
                  />
                )}
                <div>
                  <h4 className="font-medium">{selectedTour.property?.title || 'Property Tour'}</h4>
                  <p className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedTour.property?.address || 'Location TBD'}
                  </p>
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal border-black",
                        !editDate && "text-muted-foreground"
                      )}
                    >
                      {editDate ? (
                        format(editDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editDate}
                      onSelect={setEditDate}
                      disabled={(date) => 
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label>Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="pl-10 border-black focus:border-black focus:ring-black"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Any special requests or notes..."
                  className="w-full min-h-[100px] px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                />
              </div>

              {/* Client Info */}
              <div className="space-y-2">
                <Label>Client</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedTour.user?.fullName || 'Unknown Client'}</p>
                  <p className="text-sm text-gray-600">{selectedTour.user?.email || 'No email'}</p>
                  {selectedTour.user?.phone && (
                    <p className="text-sm text-gray-600">{selectedTour.user.phone}</p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                onClick={updateTourDateTime}
                disabled={isUpdating || !editDate || !editTime}
                className="bg-black text-white hover:bg-gray-800"
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Tour
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tour</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tour? This action cannot be undone.
              {selectedTour && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedTour.property?.title || 'Property Tour'}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedTour.scheduledDate), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-sm text-gray-600">Client: {selectedTour.user?.fullName || 'Unknown Client'}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTour}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Tour
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Big Calendar View */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Monthly Calendar View</h3>
        <FullMonthCalendar
          events={events}
          selectedDate={calendarSelectedDate}
          onDateSelect={setCalendarSelectedDate}
          onEventClick={(event) => {
            // Find the corresponding tour and show its details
            const tour = tours.find(t => t.id === event.id);
            if (tour) {
              setSelectedTour(tour);
            }
          }}
          onAddEvent={(date) => {
            // You can add logic here to create a new tour
            console.log('Add event for date:', date);
          }}
          onEditEvent={(event) => {
            // Find the corresponding tour and edit it
            const tour = tours.find(t => t.id === event.id);
            if (tour) {
              openEditDialog(tour);
            }
          }}
          onDeleteEvent={(eventId) => {
            // Find the corresponding tour and delete it
            const tour = tours.find(t => t.id === eventId);
            if (tour) {
              openDeleteDialog(tour);
            }
          }}
        />
      </div>
    </div>
  );
} 