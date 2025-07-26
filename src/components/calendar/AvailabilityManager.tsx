import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parse } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Calendar,
  BlockIcon,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { CalendarAPI } from '@/services/CalendarAPI';
import { AgentAvailability, AgentBlockedTime } from '@/shared/schemas/calendar';

interface AvailabilityManagerProps {
  agentId?: number; // If not provided, uses current user
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export function AvailabilityManager({ agentId }: AvailabilityManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingSlot, setEditingSlot] = useState<AgentAvailability | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showBlockTime, setShowBlockTime] = useState(false);
  
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 60,
    bufferTimeMinutes: 15,
    isActive: true
  });
  
  const [blockTimeData, setBlockTimeData] = useState({
    startDatetime: '',
    endDatetime: '',
    reason: '',
    isRecurring: false
  });

  // Get current user's agent ID if not provided
  const effectiveAgentId = agentId || 1; // Would get from auth context

  // Fetch availability
  const { data: availability, isLoading } = useQuery({
    queryKey: ['agent-availability', effectiveAgentId],
    queryFn: () => CalendarAPI.getAgentAvailability(effectiveAgentId)
  });

  // Fetch blocked times
  const { data: blockedTimes } = useQuery({
    queryKey: ['agent-blocked-times', effectiveAgentId],
    queryFn: () => fetch(`/api/calendar/agents/${effectiveAgentId}/blocked-times`).then(res => res.json())
  });

  // Set availability mutation
  const setAvailabilityMutation = useMutation({
    mutationFn: (data: any) => CalendarAPI.setAgentAvailability(effectiveAgentId, data),
    onSuccess: () => {
      toast({ title: 'Availability updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['agent-availability'] });
      setShowAddSlot(false);
      setEditingSlot(null);
      resetNewSlot();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update availability',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Block time mutation
  const blockTimeMutation = useMutation({
    mutationFn: (data: any) => CalendarAPI.blockTime(effectiveAgentId, data),
    onSuccess: () => {
      toast({ title: 'Time blocked successfully!' });
      queryClient.invalidateQueries({ queryKey: ['agent-blocked-times'] });
      setShowBlockTime(false);
      resetBlockTimeData();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to block time',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const resetNewSlot = () => {
    setNewSlot({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMinutes: 60,
      bufferTimeMinutes: 15,
      isActive: true
    });
  };

  const resetBlockTimeData = () => {
    setBlockTimeData({
      startDatetime: '',
      endDatetime: '',
      reason: '',
      isRecurring: false
    });
  };

  const handleSaveSlot = () => {
    const slotData = editingSlot ? { ...editingSlot, ...newSlot } : newSlot;
    setAvailabilityMutation.mutate(slotData);
  };

  const handleBlockTime = () => {
    if (!blockTimeData.startDatetime || !blockTimeData.endDatetime) {
      toast({
        title: 'Please fill in start and end times',
        variant: 'destructive'
      });
      return;
    }

    blockTimeMutation.mutate(blockTimeData);
  };

  const handleEditSlot = (slot: AgentAvailability) => {
    setEditingSlot(slot);
    setNewSlot({
      dayOfWeek: slot.dayOfWeek || 1,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotDurationMinutes: slot.slotDurationMinutes || 60,
      bufferTimeMinutes: slot.bufferTimeMinutes || 15,
      isActive: slot.isActive ?? true
    });
    setShowAddSlot(true);
  };

  const formatTimeRange = (start: string, end: string) => {
    return `${start} - ${end}`;
  };

  const getDayLabel = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek)?.label || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading availability...</span>
      </div>
    );
  }

  return (
    <div className="availability-manager space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Availability Management</h2>
          <p className="text-muted-foreground">
            Manage your working hours and blocked time slots
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowBlockTime(true)} variant="outline">
            <BlockIcon className="h-4 w-4 mr-2" />
            Block Time
          </Button>
          <Button onClick={() => setShowAddSlot(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Availability
          </Button>
        </div>
      </div>

      {/* Current Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Weekly Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availability && availability.length > 0 ? (
            <div className="grid gap-3">
              {DAYS_OF_WEEK.map(day => {
                const daySlots = availability.filter((slot: AgentAvailability) => 
                  slot.dayOfWeek === day.value && slot.isActive
                );
                
                return (
                  <div key={day.value} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-20 font-medium">{day.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {daySlots.length > 0 ? (
                          daySlots.map((slot: AgentAvailability) => (
                            <Badge key={slot.id} variant="outline" className="text-xs">
                              {formatTimeRange(slot.startTime, slot.endTime)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-2"
                                onClick={() => handleEditSlot(slot)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Not available</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p>No availability set</p>
              <p className="text-sm">Add your working hours to start receiving tour requests</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blocked Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BlockIcon className="h-5 w-5 mr-2" />
            Blocked Time Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blockedTimes && blockedTimes.length > 0 ? (
            <div className="space-y-2">
              {blockedTimes.map((blocked: AgentBlockedTime) => (
                <div key={blocked.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium">
                      {format(new Date(blocked.startDatetime), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(blocked.startDatetime), 'h:mm a')} - 
                      {format(new Date(blocked.endDatetime), 'h:mm a')}
                    </div>
                    {blocked.reason && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {blocked.reason}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2" />
              <p>No blocked times</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Availability Dialog */}
      {showAddSlot && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>
              {editingSlot ? 'Edit Availability' : 'Add Availability Slot'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <select
                  id="dayOfWeek"
                  value={newSlot.dayOfWeek}
                  onChange={(e) => setNewSlot(prev => ({
                    ...prev,
                    dayOfWeek: Number(e.target.value)
                  }))}
                  className="w-full border rounded px-3 py-2"
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newSlot.isActive}
                  onCheckedChange={(checked) => setNewSlot(prev => ({
                    ...prev,
                    isActive: checked
                  }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot(prev => ({
                    ...prev,
                    startTime: e.target.value
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot(prev => ({
                    ...prev,
                    endTime: e.target.value
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
                <select
                  id="slotDuration"
                  value={newSlot.slotDurationMinutes}
                  onChange={(e) => setNewSlot(prev => ({
                    ...prev,
                    slotDurationMinutes: Number(e.target.value)
                  }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div>
                <Label htmlFor="bufferTime">Buffer Time (minutes)</Label>
                <select
                  id="bufferTime"
                  value={newSlot.bufferTimeMinutes}
                  onChange={(e) => setNewSlot(prev => ({
                    ...prev,
                    bufferTimeMinutes: Number(e.target.value)
                  }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value={0}>No buffer</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleSaveSlot}
                disabled={setAvailabilityMutation.isPending}
              >
                {setAvailabilityMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingSlot ? 'Update' : 'Save'} Availability
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddSlot(false);
                  setEditingSlot(null);
                  resetNewSlot();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Block Time Dialog */}
      {showBlockTime && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Block Time Slot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDateTime">Start Date & Time</Label>
                <Input
                  id="startDateTime"
                  type="datetime-local"
                  value={blockTimeData.startDatetime}
                  onChange={(e) => setBlockTimeData(prev => ({
                    ...prev,
                    startDatetime: e.target.value
                  }))}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <Label htmlFor="endDateTime">End Date & Time</Label>
                <Input
                  id="endDateTime"
                  type="datetime-local"
                  value={blockTimeData.endDatetime}
                  onChange={(e) => setBlockTimeData(prev => ({
                    ...prev,
                    endDatetime: e.target.value
                  }))}
                  min={blockTimeData.startDatetime || new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                value={blockTimeData.reason}
                onChange={(e) => setBlockTimeData(prev => ({
                  ...prev,
                  reason: e.target.value
                }))}
                placeholder="Meeting, vacation, personal time, etc."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isRecurring"
                checked={blockTimeData.isRecurring}
                onCheckedChange={(checked) => setBlockTimeData(prev => ({
                  ...prev,
                  isRecurring: checked
                }))}
              />
              <Label htmlFor="isRecurring">Recurring block</Label>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleBlockTime}
                disabled={blockTimeMutation.isPending}
                variant="destructive"
              >
                {blockTimeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BlockIcon className="h-4 w-4 mr-2" />
                )}
                Block Time
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBlockTime(false);
                  resetBlockTimeData();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AvailabilityManager;