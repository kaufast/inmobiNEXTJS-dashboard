import { CalendarEvent, TimeSlot, TourBooking, CalendarStats } from '@/shared/schemas/calendar';

export class CalendarAPI {
  private static baseURL = '/api/calendar';

  // Tour Booking Methods
  static async requestTour(data: {
    propertyId: number;
    agentId: number;
    requestedDateTime: Date | string;
    durationMinutes?: number;
    isVirtual?: boolean;
    userNotes?: string;
    participants?: Array<{
      participantName: string;
      participantEmail?: string;
      participantPhone?: string;
      relationship?: string;
    }>;
  }): Promise<TourBooking> {
    const response = await fetch(`${this.baseURL}/tours/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        requestedDateTime: typeof data.requestedDateTime === 'string' 
          ? data.requestedDateTime 
          : data.requestedDateTime.toISOString()
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to request tour');
    }

    const result = await response.json();
    return result.booking;
  }

  static async confirmTour(
    bookingId: number, 
    confirmedDateTime?: string
  ): Promise<TourBooking> {
    const response = await fetch(`${this.baseURL}/tours/${bookingId}/confirm`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ confirmedDateTime }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to confirm tour');
    }

    const result = await response.json();
    return result.booking;
  }

  static async requestReschedule(
    bookingId: number,
    newDateTime?: string,
    reason?: string
  ): Promise<TourBooking> {
    console.log('CalendarAPI.requestReschedule called with:', { bookingId, newDateTime, reason });
    
    const requestBody = { newDateTime, reason };
    console.log('Request body:', requestBody);
    
    const response = await fetch(`${this.baseURL}/tours/${bookingId}/reschedule`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const error = await response.json();
      console.log('API Error response:', error);
      throw new Error(error.message || 'Failed to request reschedule');
    }

    const result = await response.json();
    console.log('API Success response:', result);
    return result.booking;
  }

  static async cancelTour(bookingId: number, reason: string): Promise<TourBooking> {
    const response = await fetch(`${this.baseURL}/tours/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel tour');
    }

    const result = await response.json();
    return result.booking;
  }

  static async completeTour(bookingId: number, notes: string): Promise<TourBooking> {
    const response = await fetch(`${this.baseURL}/tours/${bookingId}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete tour');
    }

    const result = await response.json();
    return result.booking;
  }

  static async deleteTour(bookingId: number): Promise<{ message: string; bookingId: number }> {
    const response = await fetch(`${this.baseURL}/tours/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete tour');
    }

    return response.json();
  }

  // Calendar Events
  static async getEvents(params: {
    start: Date;
    end: Date;
    agentId?: number;
    userId?: number;
    view?: string;
  }): Promise<{ events: CalendarEvent[] }> {
    const searchParams = new URLSearchParams({
      start: params.start.toISOString(),
      end: params.end.toISOString(),
    });

    if (params.agentId) searchParams.append('agentId', params.agentId.toString());
    if (params.userId) searchParams.append('userId', params.userId.toString());
    if (params.view) searchParams.append('view', params.view);

    const response = await fetch(`${this.baseURL}/events?${searchParams}`);

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    return response.json();
  }

  // Available Slots
  static async getAvailableSlots(params: {
    agentId: number;
    propertyId?: number;
    startDate: string;
    endDate: string;
    duration?: number;
  }): Promise<TimeSlot[]> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      duration: (params.duration || 60).toString(),
    });

    if (params.propertyId) {
      searchParams.append('propertyId', params.propertyId.toString());
    }

    const response = await fetch(
      `${this.baseURL}/agents/${params.agentId}/slots?${searchParams}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch available slots');
    }

    const result = await response.json();
    return result.slots.map((slot: any) => ({
      ...slot,
      start: new Date(slot.start),
      end: new Date(slot.end)
    }));
  }

  // Agent Availability
  static async getAgentAvailability(agentId: number) {
    const response = await fetch(`${this.baseURL}/agents/${agentId}/availability`);

    if (!response.ok) {
      throw new Error('Failed to fetch agent availability');
    }

    const result = await response.json();
    return result.availability;
  }

  static async setAgentAvailability(agentId: number, availability: any) {
    const response = await fetch(`${this.baseURL}/agents/${agentId}/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(availability),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set availability');
    }

    const result = await response.json();
    return result.availability;
  }

  static async blockTime(agentId: number, blockData: {
    startDatetime: string;
    endDatetime: string;
    reason?: string;
    isRecurring?: boolean;
    recurrencePattern?: any;
  }) {
    const response = await fetch(`${this.baseURL}/agents/${agentId}/block-time`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blockData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to block time');
    }

    const result = await response.json();
    return result.blockedTime;
  }

  // Notifications
  static async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.unreadOnly) searchParams.append('unreadOnly', 'true');

    const response = await fetch(`${this.baseURL}/notifications?${searchParams}`);

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const result = await response.json();
    return result.notifications;
  }

  static async markNotificationRead(notificationId: number) {
    const response = await fetch(`${this.baseURL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return response.json();
  }

  // Statistics
  static async getStats(agentId?: number): Promise<CalendarStats> {
    const url = agentId 
      ? `/api/admin/calendar/stats?agentId=${agentId}` 
      : '/api/admin/calendar/stats';
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch calendar statistics');
    }

    return response.json();
  }

  // Analytics
  static async getAnalytics(agentId?: number) {
    const url = agentId 
      ? `/api/admin/calendar/analytics?agentId=${agentId}` 
      : '/api/admin/calendar/analytics';
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch calendar analytics');
    }

    return response.json();
  }
}