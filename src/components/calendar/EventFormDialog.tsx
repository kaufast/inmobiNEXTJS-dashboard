import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin, User, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { CalendarEvent } from './FullMonthCalendar';
import { cn } from '@/lib/utils';

/**
 * Form data interface for creating/editing events
 */
interface EventFormData {
  title: string;
  date: Date;
  time: string;
  type: 'tour' | 'meeting' | 'appointment' | 'other';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  clientName?: string;
  propertyTitle?: string;
  location?: string;
  notes?: string;
}

/**
 * Props for the EventFormDialog component
 */
interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  initialDate?: Date;
  onSave: (data: EventFormData) => void;
  onDelete?: (eventId: string) => void;
  isLoading?: boolean;
}

/**
 * Event creation/editing form dialog component
 * Features:
 * - Add new events or edit existing ones
 * - Date and time selection
 * - Event type and status selection
 * - Client and property information
 * - Notes and location fields
 * - Validation and error handling
 */
export function EventFormDialog({
  open,
  onOpenChange,
  event,
  initialDate,
  onSave,
  onDelete,
  isLoading = false
}: EventFormDialogProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: initialDate || new Date(),
    time: '09:00',
    type: 'tour',
    status: 'pending',
    clientName: '',
    propertyTitle: '',
    location: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  /**
   * Initialize form data when dialog opens or event changes
   */
  useEffect(() => {
    if (open) {
      if (event) {
        // Editing existing event
        setFormData({
          title: event.title,
          date: new Date(event.date),
          time: event.time || '09:00',
          type: event.type,
          status: event.status || 'pending',
          clientName: event.clientName || '',
          propertyTitle: event.propertyTitle || '',
          location: event.location || '',
          notes: event.notes || ''
        });
      } else {
        // Creating new event
        setFormData({
          title: '',
          date: initialDate || new Date(),
          time: '09:00',
          type: 'tour',
          status: 'pending',
          clientName: '',
          propertyTitle: '',
          location: '',
          notes: ''
        });
      }
      setErrors({});
    }
  }, [open, event, initialDate]);

  /**
   * Handle form field changes
   */
  const handleFieldChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    // Validate that event is not in the past (for new events)
    if (!event && formData.date) {
      const eventDateTime = new Date(formData.date);
      const [hours, minutes] = formData.time.split(':');
      eventDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      if (eventDateTime < new Date()) {
        newErrors.date = 'Cannot schedule events in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    if (!validateForm()) return;

    onSave(formData);
  };

  /**
   * Handle event deletion
   */
  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
    }
  };

  /**
   * Generate time options for select dropdown
   */
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const display = format(new Date(`2000-01-01T${time}`), 'h:mm a');
    return { value: time, label: display };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogDescription>
            {event 
              ? 'Update the details for this event'
              : 'Fill in the details to create a new calendar event'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Event Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Enter event title..."
              className={cn(
                "border-black focus:border-black focus:ring-black",
                errors.title && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label>
                Date <span className="text-red-500">*</span>
              </Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal border-black focus:border-black focus:ring-black",
                      !formData.date && "text-muted-foreground",
                      errors.date && "border-red-500"
                    )}
                  >
                    {formData.date ? (
                      format(formData.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      if (date) {
                        handleFieldChange('date', date);
                        setDatePickerOpen(false);
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label>
                Time <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.time}
                onValueChange={(value) => handleFieldChange('time', value)}
              >
                <SelectTrigger className={cn(
                  "border-black focus:border-black focus:ring-black",
                  errors.time && "border-red-500"
                )}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <SelectValue placeholder="Select time" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.time && (
                <p className="text-sm text-red-500">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Event Type and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Type */}
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'tour' | 'meeting' | 'appointment' | 'other') => 
                  handleFieldChange('type', value)
                }
              >
                <SelectTrigger className="border-black focus:border-black focus:ring-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tour">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Property Tour
                    </div>
                  </SelectItem>
                  <SelectItem value="meeting">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Client Meeting
                    </div>
                  </SelectItem>
                  <SelectItem value="appointment">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Appointment
                    </div>
                  </SelectItem>
                  <SelectItem value="other">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Other
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'pending' | 'confirmed' | 'completed' | 'cancelled') => 
                  handleFieldChange('status', value)
                }
              >
                <SelectTrigger className="border-black focus:border-black focus:ring-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Name (for tours and meetings) */}
          {(formData.type === 'tour' || formData.type === 'meeting') && (
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleFieldChange('clientName', e.target.value)}
                placeholder="Enter client name..."
                className="border-black focus:border-black focus:ring-black"
              />
            </div>
          )}

          {/* Property Title (for tours) */}
          {formData.type === 'tour' && (
            <div className="space-y-2">
              <Label htmlFor="propertyTitle">Property Title</Label>
              <Input
                id="propertyTitle"
                value={formData.propertyTitle}
                onChange={(e) => handleFieldChange('propertyTitle', e.target.value)}
                placeholder="Enter property title..."
                className="border-black focus:border-black focus:ring-black"
              />
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              placeholder="Enter location or address..."
              className="border-black focus:border-black focus:ring-black"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Add any additional notes or details..."
              className="border-black focus:border-black focus:ring-black min-h-[80px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {event && onDelete && (
              <Button
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={handleDelete}
                disabled={isLoading}
              >
                Delete Event
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isLoading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}