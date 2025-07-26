import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Video,
  Phone,
  Mail,
  Edit,
  X,
  Check,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { CalendarEvent, TourStatus } from '@/shared/schemas/calendar';
import { CalendarAPI } from '@/services/CalendarAPI';
import AddToCalendarButton, { CalendarEvent as AddToCalendarEvent } from './AddToCalendarButton';

interface TourDetailsModalProps {
  booking: CalendarEvent;
  userType: 'user' | 'agent' | 'admin';
  isOpen: boolean;
  onClose: () => void;
}

export function TourDetailsModal({ booking, userType, isOpen, onClose }: TourDetailsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [actionType, setActionType] = useState<'confirm' | 'reschedule' | 'cancel' | null>(null);
  const [confirmedDateTime, setConfirmedDateTime] = useState('');
  const [rescheduleDateTime, setRescheduleDateTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Convert booking to AddToCalendarButton format
  const createCalendarEvent = (): AddToCalendarEvent => {
    const eventType = booking.isVirtual ? 'Virtual Property Tour' : 'Property Tour';
    const description = `${eventType} - ${booking.property.title}

Property Details:
• Address: ${booking.property.address}
• Tour Type: ${booking.isVirtual ? 'Virtual' : 'In-Person'}
• Duration: ${Math.round((booking.end.getTime() - booking.start.getTime()) / (1000 * 60))} minutes

Agent: ${booking.agent.name}
Email: ${booking.agent.email}
${booking.agent.phone ? `Phone: ${booking.agent.phone}` : ''}

${booking.isVirtual && booking.meetingLink ? `Meeting Link: ${booking.meetingLink}` : ''}
${booking.notes ? `\nNotes: ${booking.notes}` : ''}

Contact inmobimobi for any questions or changes.`;

    return {
      title: `${eventType} - ${booking.property.title}`,
      description,
      location: booking.isVirtual ? 'Virtual Tour (Online)' : booking.property.address,
      startDate: booking.start,
      endDate: booking.end,
      organizer: {
        name: booking.agent.name,
        email: booking.agent.email
      },
      attendees: [
        {
          name: booking.user.name,
          email: booking.user.email
        },
        ...(booking.participants || []).map(p => ({
          name: p.participantName,
          email: p.participantEmail || ''
        }))
      ].filter(attendee => attendee.email) // Only include attendees with valid emails
    };
  };

  // Mutations
  const confirmTourMutation = useMutation({
    mutationFn: ({ id, confirmedDateTime }: { id: number; confirmedDateTime?: string }) =>
      CalendarAPI.confirmTour(id, confirmedDateTime),
    onSuccess: () => {
      toast({ title: 'Tour confirmed successfully!' });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to confirm tour', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const rescheduleRequestMutation = useMutation({
    mutationFn: ({ id, newDateTime, reason }: { id: number; newDateTime?: string; reason: string }) => {
      console.log('=== RESCHEDULE API CALL ===');
      console.log('Mutation params:', { id, newDateTime, reason });
      return CalendarAPI.requestReschedule(id, newDateTime, reason);
    },
    onSuccess: (data) => {
      console.log('=== RESCHEDULE SUCCESS ===');
      console.log('Response data:', data);
      toast({ title: 'Reschedule request sent successfully!' });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      onClose();
    },
    onError: (error: any) => {
      console.log('=== RESCHEDULE ERROR ===');
      console.error('Error details:', error);
      console.log('Error message:', error.message);
      toast({ 
        title: 'Failed to request reschedule', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const cancelTourMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      CalendarAPI.cancelTour(id, reason),
    onSuccess: () => {
      toast({ title: 'Tour cancelled successfully!' });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to cancel tour', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const completeTourMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      CalendarAPI.completeTour(id, notes),
    onSuccess: () => {
      toast({ title: 'Tour marked as completed!' });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to complete tour', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // Status configuration
  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pending Confirmation',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      description: 'Waiting for agent confirmation'
    },
    confirmed: {
      icon: CheckCircle,
      label: 'Confirmed',
      color: 'bg-green-100 text-green-800 border-green-300',
      description: 'Tour is confirmed and scheduled'
    },
    cancelled: {
      icon: XCircle,
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800 border-red-300',
      description: 'Tour has been cancelled'
    },
    completed: {
      icon: Check,
      label: 'Completed',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      description: 'Tour has been completed'
    },
    reschedule_requested: {
      icon: RotateCcw,
      label: 'Reschedule Requested',
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      description: 'Reschedule has been requested'
    },
    no_show: {
      icon: AlertTriangle,
      label: 'No Show',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      description: 'Client did not show up for the tour'
    }
  };

  const currentStatus = statusConfig[booking.status];
  const StatusIcon = currentStatus.icon;

  // Action handlers
  const handleConfirm = () => {
    confirmTourMutation.mutate({
      id: booking.id,
      confirmedDateTime: confirmedDateTime || undefined
    });
  };

  const handleReschedule = () => {
    console.log('=== RESCHEDULE BUTTON CLICKED ===');
    console.log('Booking ID:', booking.id);
    console.log('New DateTime:', rescheduleDateTime);
    console.log('Reason:', reason);
    console.log('Current booking status:', booking.status);
    
    rescheduleRequestMutation.mutate({
      id: booking.id,
      newDateTime: rescheduleDateTime || undefined,
      reason
    });
  };

  const handleCancel = () => {
    cancelTourMutation.mutate({
      id: booking.id,
      reason
    });
  };

  const handleComplete = () => {
    completeTourMutation.mutate({
      id: booking.id,
      notes
    });
  };

  // Determine available actions based on user type and status
  const getAvailableActions = () => {
    const actions = [];

    if (userType === 'agent') {
      if (booking.status === 'pending') {
        actions.push('confirm', 'reschedule', 'cancel');
      } else if (booking.status === 'confirmed') {
        actions.push('reschedule', 'cancel', 'complete');
      } else if (booking.status === 'reschedule_requested') {
        actions.push('confirm', 'cancel');
      }
    } else if (userType === 'user') {
      if (['pending', 'confirmed'].includes(booking.status)) {
        actions.push('reschedule', 'cancel');
      }
    } else if (userType === 'admin') {
      actions.push('confirm', 'reschedule', 'cancel', 'complete');
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <StatusIcon className="h-5 w-5" />
            <span>Tour Details</span>
          </DialogTitle>
          <DialogDescription>
            Tour details and management options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge className={`${currentStatus.color} px-3 py-1`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {currentStatus.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {currentStatus.description}
            </span>
          </div>

          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{booking.property.title}</p>
                  <p className="text-sm text-muted-foreground">{booking.property.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tour Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tour Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(booking.start, 'EEEE, MMMM do, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(booking.start, 'h:mm a')} - {format(booking.end, 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((booking.end.getTime() - booking.start.getTime()) / (1000 * 60))} minutes
                    </p>
                  </div>
                </div>
              </div>

              {/* Add to Calendar Button */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Add to Your Calendar</p>
                  </div>
                  <AddToCalendarButton 
                    event={createCalendarEvent()}
                    variant="outline"
                    size="sm"
                    dropdownPosition="left"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Save this tour to your calendar to get reminders and easy access to details
                </p>
              </div>

              {booking.isVirtual && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
                  <Video className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Virtual Tour</p>
                    {booking.meetingLink && (
                      <a 
                        href={booking.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center"
                      >
                        Join Meeting <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {/* User/Buyer */}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{booking.user.name}</p>
                    <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {userType === 'agent' ? 'Client' : 'You'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Agent */}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{booking.agent.name}</p>
                    <p className="text-sm text-muted-foreground">{booking.agent.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {userType === 'user' ? 'Agent' : 'You'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Participants */}
              {booking.participants && booking.participants.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Additional Participants
                  </p>
                  <div className="space-y-2">
                    {booking.participants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{participant.participantName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {participant.relationship || 'Guest'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {booking.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {booking.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Forms */}
          {actionType && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {actionType === 'confirm' && 'Confirm Tour'}
                  {actionType === 'reschedule' && 'Reschedule Tour'}
                  {actionType === 'cancel' && 'Cancel Tour'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {actionType === 'confirm' && (
                  <div>
                    <Label htmlFor="confirmDateTime">Confirm Date & Time (Optional)</Label>
                    <Input
                      id="confirmDateTime"
                      type="datetime-local"
                      value={confirmedDateTime}
                      onChange={(e) => setConfirmedDateTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to confirm the originally requested time
                    </p>
                  </div>
                )}

                {actionType === 'reschedule' && (
                  <div>
                    <Label htmlFor="rescheduleDateTime">New Date & Time (Optional)</Label>
                    <Input
                      id="rescheduleDateTime"
                      type="datetime-local"
                      value={rescheduleDateTime}
                      onChange={(e) => {
                        console.log('Reschedule date changed:', e.target.value);
                        setRescheduleDateTime(e.target.value);
                      }}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to request reschedule without specific time
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="actionReason">
                    {actionType === 'cancel' ? 'Cancellation Reason' : 'Reason/Notes'}
                  </Label>
                  <Textarea
                    id="actionReason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={`Enter ${actionType === 'cancel' ? 'cancellation reason' : 'reason or notes'}...`}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complete Tour Form */}
          {actionType === 'complete' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Complete Tour</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="completionNotes">Tour Notes</Label>
                  <Textarea
                    id="completionNotes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about the tour completion..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {actionType ? (
              <Button variant="outline" onClick={() => setActionType(null)}>
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>

          <div className="flex space-x-2">
            {!actionType && availableActions.length > 0 && (
              <>
                {availableActions.includes('confirm') && (
                  <Button 
                    onClick={() => setActionType('confirm')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirm
                  </Button>
                )}
                
                {availableActions.includes('reschedule') && (
                  <Button 
                    variant="outline" 
                    onClick={() => setActionType('reschedule')}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reschedule
                  </Button>
                )}
                
                {availableActions.includes('complete') && (
                  <Button 
                    onClick={() => setActionType('complete')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                )}
                
                {availableActions.includes('cancel') && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setActionType('cancel')}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </>
            )}

            {actionType && (
              <Button 
                onClick={() => {
                  if (actionType === 'confirm') handleConfirm();
                  else if (actionType === 'reschedule') handleReschedule();
                  else if (actionType === 'cancel') handleCancel();
                  else if (actionType === 'complete') handleComplete();
                }}
                disabled={
                  confirmTourMutation.isPending ||
                  rescheduleRequestMutation.isPending ||
                  cancelTourMutation.isPending ||
                  completeTourMutation.isPending ||
                  (actionType === 'cancel' && !reason.trim())
                }
                className={
                  actionType === 'confirm' ? 'bg-green-600 hover:bg-green-700' :
                  actionType === 'complete' ? 'bg-blue-600 hover:bg-blue-700' :
                  actionType === 'cancel' ? 'bg-red-600 hover:bg-red-700' :
                  ''
                }
              >
                {(confirmTourMutation.isPending || 
                  rescheduleRequestMutation.isPending || 
                  cancelTourMutation.isPending ||
                  completeTourMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {actionType === 'confirm' && 'Confirm Tour'}
                {actionType === 'reschedule' && 'Request Reschedule'}
                {actionType === 'cancel' && 'Cancel Tour'}
                {actionType === 'complete' && 'Mark Complete'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TourDetailsModal;