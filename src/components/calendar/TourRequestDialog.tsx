import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Video,
  Phone,
  Mail,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { CalendarAPI } from '@/services/CalendarAPI';
import { TimeSlot } from '@/shared/schemas/calendar';

interface TourRequestDialogProps {
  agentId: number;
  propertyId: number;
  initialSlot?: { start: Date; end: Date };
  isOpen: boolean;
  onClose: () => void;
}

interface Participant {
  participantName: string;
  participantEmail?: string;
  participantPhone?: string;
  relationship?: string;
}

export function TourRequestDialog({ 
  agentId, 
  propertyId, 
  initialSlot, 
  isOpen, 
  onClose 
}: TourRequestDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['tours', 'common']);
  
  const [selectedDate, setSelectedDate] = useState<Date>(initialSlot?.start || new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [duration, setDuration] = useState(60);
  const [isVirtual, setIsVirtual] = useState(false);
  const [notes, setNotes] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipant, setNewParticipant] = useState<Participant>({
    participantName: '',
    participantEmail: '',
    participantPhone: '',
    relationship: ''
  });

  // Fetch property details
  const { data: property } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => fetch(`/api/properties/${propertyId}`).then(res => res.json()),
    enabled: isOpen
  });

  // Fetch agent details
  const { data: agent } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => fetch(`/api/users/${agentId}`).then(res => res.json()),
    enabled: isOpen
  });

  // Calculate date range for available slots
  const startDate = selectedDate;
  const endDate = addDays(selectedDate, 6); // Show one week

  // Fetch available time slots
  const { data: availableSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ['available-slots', agentId, propertyId, startDate, endDate, duration],
    queryFn: () => CalendarAPI.getAvailableSlots({
      agentId,
      propertyId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration
    }),
    enabled: isOpen && !!agentId
  });

  // Request tour mutation
  const requestTourMutation = useMutation({
    mutationFn: (data: any) => CalendarAPI.requestTour(data),
    onSuccess: () => {
      toast({
        title: 'Tour Requested!',
        description: 'Your tour request has been sent to the agent for confirmation.'
      });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: t('tours:errors.failedToRequestTour'),
        description: error.message || t('tours:errors.genericError'),
        variant: 'destructive'
      });
    }
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Set initial slot if provided
  useEffect(() => {
    if (initialSlot && availableSlots) {
      const matchingSlot = availableSlots.find(slot => 
        Math.abs(new Date(slot.start).getTime() - initialSlot.start.getTime()) < 60000
      );
      if (matchingSlot) {
        setSelectedSlot(matchingSlot);
      }
    }
  }, [initialSlot, availableSlots]);

  const resetForm = () => {
    setSelectedDate(new Date());
    setSelectedSlot(null);
    setDuration(60);
    setIsVirtual(false);
    setNotes('');
    setParticipants([]);
    setShowAddParticipant(false);
    setNewParticipant({
      participantName: '',
      participantEmail: '',
      participantPhone: '',
      relationship: ''
    });
  };

  const handleAddParticipant = () => {
    if (newParticipant.participantName.trim()) {
      setParticipants(prev => [...prev, { ...newParticipant }]);
      setNewParticipant({
        participantName: '',
        participantEmail: '',
        participantPhone: '',
        relationship: ''
      });
      setShowAddParticipant(false);
    }
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitRequest = () => {
    if (!selectedSlot) {
      toast({
        title: 'Please select a time slot',
        variant: 'destructive'
      });
      return;
    }

    requestTourMutation.mutate({
      propertyId,
      agentId,
      requestedDateTime: selectedSlot.start,
      durationMinutes: duration,
      isVirtual,
      userNotes: notes.trim() || undefined,
      participants: participants.length > 0 ? participants : undefined
    });
  };

  // Get slots for selected date
  const slotsForDate = availableSlots?.filter(slot => 
    isSameDay(new Date(slot.start), selectedDate)
  ) || [];

  // Popular time slots
  const popularTimes = ['09:00', '10:00', '14:00', '15:00', '16:00', '17:00'];

  const isSlotPopular = (slot: TimeSlot) => {
    const timeString = format(new Date(slot.start), 'HH:mm');
    return popularTimes.includes(timeString);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Schedule Property Tour</span>
          </DialogTitle>
          <DialogDescription>
            {property && agent ? (
              <>Book a tour for {property.title} with {agent.fullName}</>
            ) : (
              'Loading property and agent details...'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Summary */}
          {property && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{property.title}</h3>
                    <div className="flex items-center space-x-1 text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{property.address}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="secondary">{property.type}</Badge>
                      <span className="text-sm font-medium">£{property.price?.toLocaleString()}</span>
                    </div>
                  </div>
                  {agent && (
                    <div className="text-right">
                      <p className="font-medium">{agent.fullName}</p>
                      <p className="text-sm text-muted-foreground">{agent.role}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Phone className="h-3 w-3" />
                        <span className="text-xs">{agent.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tour Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tour Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="virtual-tour"
                    checked={isVirtual}
                    onCheckedChange={setIsVirtual}
                  />
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4" />
                    <Label htmlFor="virtual-tour">Virtual Tour</Label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="duration">Duration:</Label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
              {isVirtual && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      Virtual tour link will be provided after confirmation
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Picker */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                    }
                  }}
                  disabled={(date) => 
                    date < new Date() || 
                    date > addDays(new Date(), 30)
                  }
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Time Slot Picker */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Times</CardTitle>
                <DialogDescription>
                  {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                </DialogDescription>
              </CardHeader>
              <CardContent>
                {slotsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading available times...</span>
                  </div>
                ) : slotsForDate.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {slotsForDate.map((slot, index) => {
                      const timeString = format(new Date(slot.start), 'h:mm a');
                      const isSelected = selectedSlot?.start === slot.start;
                      const isPopular = isSlotPopular(slot);
                      
                      return (
                        <Button
                          key={index}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSlot(slot)}
                          className={`text-sm relative ${
                            isPopular ? 'ring-2 ring-blue-200' : ''
                          }`}
                        >
                          {timeString}
                          {isPopular && (
                            <Badge 
                              variant="secondary" 
                              className="absolute -top-1 -right-1 text-xs px-1"
                            >
                              ★
                            </Badge>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                    <p>No available times for this date</p>
                    <p className="text-sm">Try selecting a different date</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Participants
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddParticipant(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {participants.length > 0 && (
                <div className="space-y-2">
                  {participants.map((participant, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{participant.participantName}</p>
                        {participant.participantEmail && (
                          <p className="text-sm text-muted-foreground">
                            {participant.participantEmail}
                          </p>
                        )}
                        {participant.relationship && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {participant.relationship}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveParticipant(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {showAddParticipant && (
                <div className="border rounded-md p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="participant-name">Name *</Label>
                      <Input
                        id="participant-name"
                        value={newParticipant.participantName}
                        onChange={(e) => setNewParticipant(prev => ({
                          ...prev,
                          participantName: e.target.value
                        }))}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="participant-email">Email</Label>
                      <Input
                        id="participant-email"
                        type="email"
                        value={newParticipant.participantEmail}
                        onChange={(e) => setNewParticipant(prev => ({
                          ...prev,
                          participantEmail: e.target.value
                        }))}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="participant-phone">Phone</Label>
                      <Input
                        id="participant-phone"
                        value={newParticipant.participantPhone}
                        onChange={(e) => setNewParticipant(prev => ({
                          ...prev,
                          participantPhone: e.target.value
                        }))}
                        placeholder="+44 7xxx xxx xxx"
                      />
                    </div>
                    <div>
                      <Label htmlFor="participant-relationship">Relationship</Label>
                      <select
                        id="participant-relationship"
                        value={newParticipant.relationship}
                        onChange={(e) => setNewParticipant(prev => ({
                          ...prev,
                          relationship: e.target.value
                        }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="spouse">Spouse/Partner</option>
                        <option value="family">Family Member</option>
                        <option value="friend">Friend</option>
                        <option value="colleague">Colleague</option>
                        <option value="advisor">Advisor</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleAddParticipant}>
                      Add Participant
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddParticipant(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Special Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requirements, questions, or additional information..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Selected Tour Summary */}
          {selectedSlot && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Tour Summary</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-green-600" />
                    <span>{format(new Date(selectedSlot.start), 'EEEE, MMMM do, yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>
                      {format(new Date(selectedSlot.start), 'h:mm a')} - 
                      {format(new Date(selectedSlot.end), 'h:mm a')} ({duration} minutes)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isVirtual ? (
                      <Video className="h-4 w-4 text-green-600" />
                    ) : (
                      <MapPin className="h-4 w-4 text-green-600" />
                    )}
                    <span>{isVirtual ? 'Virtual Tour' : 'In-Person Tour'}</span>
                  </div>
                  {participants.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span>{participants.length + 1} participant{participants.length > 0 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitRequest}
            disabled={!selectedSlot || requestTourMutation.isPending}
          >
            {requestTourMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('tours:actions.requesting')}
              </>
            ) : (
              t('tours:actions.requestTour')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TourRequestDialog;