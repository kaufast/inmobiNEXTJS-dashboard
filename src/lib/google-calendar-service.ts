import { apiRequest } from './queryClient';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  location?: string;
}

export interface CalendarBusyTime {
  start: string;
  end: string;
}

export interface CalendarStatus {
  connected: boolean;
}

/**
 * Service for managing Google Calendar integration
 */
export const GoogleCalendarService = {
  /**
   * Check if user has Google Calendar connected
   */
  async getConnectionStatus(): Promise<CalendarStatus> {
    const res = await apiRequest('GET', '/api/auth/google/calendar/status');
    return res.json();
  },

  /**
   * Get auth URL to connect Google Calendar
   */
  async getConnectUrl(): Promise<{ authUrl: string }> {
    const res = await apiRequest('GET', '/api/auth/google/calendar/connect');
    return res.json();
  },

  /**
   * Disconnect Google Calendar
   */
  async disconnect(): Promise<{ message: string }> {
    const res = await apiRequest('POST', '/api/auth/google/calendar/disconnect');
    return res.json();
  },

  /**
   * Get user's calendar events for a date range
   */
  async getEvents(startDate: string, endDate: string): Promise<{ events: any[] }> {
    const res = await apiRequest('GET', `/api/auth/google/calendar/events?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
    return res.json();
  },

  /**
   * Get busy times for a specific date
   */
  async getBusyTimes(date: string): Promise<{ busyTimes: CalendarBusyTime[] }> {
    const res = await apiRequest('GET', `/api/auth/google/calendar/busy-times?date=${encodeURIComponent(date)}`);
    return res.json();
  },

  /**
   * Sync a property tour to Google Calendar
   */
  async syncTour(tourId: number): Promise<{ message: string; eventId?: string }> {
    const res = await apiRequest('POST', `/api/auth/google/calendar/sync-tour/${tourId}`);
    return res.json();
  },

  /**
   * Create a manual calendar event
   */
  async createEvent(event: CalendarEvent): Promise<{ message: string; eventId?: string }> {
    const res = await apiRequest('POST', '/api/auth/google/calendar/events', event);
    return res.json();
  },

  /**
   * Check if a time slot conflicts with existing calendar events
   */
  async checkTimeSlotAvailability(date: string, startTime: string, endTime: string): Promise<{ available: boolean; conflicts?: CalendarBusyTime[] }> {
    try {
      const { busyTimes } = await this.getBusyTimes(date);
      
      const requestedStart = new Date(`${date}T${startTime}`);
      const requestedEnd = new Date(`${date}T${endTime}`);
      
      const conflicts = busyTimes.filter(busyTime => {
        const busyStart = new Date(busyTime.start);
        const busyEnd = new Date(busyTime.end);
        
        // Check for overlap
        return (requestedStart < busyEnd && requestedEnd > busyStart);
      });
      
      return {
        available: conflicts.length === 0,
        conflicts: conflicts.length > 0 ? conflicts : undefined
      };
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      // If we can't check calendar, assume available (fallback)
      return { available: true };
    }
  },

  /**
   * Get available time slots for a specific date
   */
  async getAvailableTimeSlots(date: string, duration: number = 60): Promise<string[]> {
    try {
      const { busyTimes } = await this.getBusyTimes(date);
      
      const availableSlots: string[] = [];
      const startHour = 9; // 9 AM
      const endHour = 17; // 5 PM
      const slotDuration = 30; // 30 minutes
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
          const slotStart = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
          const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);
          
          // Check if this slot conflicts with any busy time
          const hasConflict = busyTimes.some(busyTime => {
            const busyStart = new Date(busyTime.start);
            const busyEnd = new Date(busyTime.end);
            return (slotStart < busyEnd && slotEnd > busyStart);
          });
          
          if (!hasConflict && slotEnd.getHours() <= endHour) {
            availableSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
          }
        }
      }
      
      return availableSlots;
    } catch (error) {
      console.error('Error getting available time slots:', error);
      // Return default time slots if calendar check fails
      return ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
    }
  },

  /**
   * Format time for display
   */
  formatTime(time: string): string {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  }
};