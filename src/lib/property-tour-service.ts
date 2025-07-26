import { apiRequest } from "./queryClient";
import { PropertyTour } from "@shared/schema";

export interface ScheduleTourData {
  propertyId: number;
  userId: number;
  agentId: number;
  scheduledDate: string;
  endTime: string;
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DetailedTimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface TourAvailability {
  date: string;
  timeSlots: DetailedTimeSlot[];
}

export interface AgentAvailability {
  agentId: number;
  name: string;
  email: string;
  timeSlots: DetailedTimeSlot[];
}

export interface Agent {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
}

export interface AlternativeTimes {
  message: string;
  alternativeTimes: DetailedTimeSlot[];
}

/**
 * Service for managing property tours
 */
export const PropertyTourService = {
  /**
   * Get tours for a user
   * @param userId User ID
   * @returns Promise resolving to list of property tours
   */
  getUserTours: async (userId: number): Promise<PropertyTour[]> => {
    const res = await apiRequest("GET", `/api/property-tours/user/${userId}`);
    return res.json();
  },
  
  /**
   * Get tours for a property
   * @param propertyId Property ID
   * @returns Promise resolving to list of property tours
   */
  getPropertyTours: async (propertyId: number): Promise<PropertyTour[]> => {
    const res = await apiRequest("GET", `/api/property-tours/property/${propertyId}`);
    return res.json();
  },
  
  /**
   * Get tours for an agent
   * @param agentId Agent ID
   * @returns Promise resolving to list of property tours
   */
  getAgentTours: async (agentId: number): Promise<PropertyTour[]> => {
    const res = await apiRequest("GET", `/api/property-tours/agent/${agentId}`);
    return res.json();
  },
  
  /**
   * Schedule a property tour
   * @param data Tour data
   * @returns Promise resolving to the created tour
   * @throws {AlternativeTimes} When the requested time is not available, including alternative times
   */
  scheduleTour: async (data: ScheduleTourData): Promise<PropertyTour> => {
    try {
      const res = await apiRequest("POST", "/api/property-tours", data);
      if (res.ok) {
        return res.json();
      } else if (res.status === 409) {
        // Time slot not available - the response will include alternative times
        const errorData = await res.json() as AlternativeTimes;
        throw errorData;
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to schedule tour');
      }
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Update tour status
   * @param tourId Tour ID
   * @param status New status (confirmed, completed, canceled)
   * @returns Promise resolving to the updated tour
   */
  updateTourStatus: async (tourId: number, status: string): Promise<PropertyTour> => {
    const res = await apiRequest("PATCH", `/api/property-tours/${tourId}/status`, { status });
    return res.json();
  },
  
  /**
   * Cancel a tour
   * @param tourId Tour ID
   * @returns Promise resolving to success status
   */
  cancelTour: async (tourId: number): Promise<any> => {
    const res = await apiRequest("DELETE", `/api/property-tours/${tourId}`);
    return res.json();
  },
  
  /**
   * Check availability for a property on a specific date
   * @param propertyId Property ID
   * @param date Date string (YYYY-MM-DD)
   * @returns Promise resolving to availability data
   */
  checkAvailability: async (propertyId: number, date: string): Promise<TourAvailability> => {
    const res = await apiRequest("GET", `/api/property-tours/availability/${propertyId}?date=${date}`);
    return res.json();
  },
  
  /**
   * Get agent's availability for a specific date
   * @param agentId Agent ID
   * @param date Date string (YYYY-MM-DD)
   * @returns Promise resolving to agent availability data
   */
  getAgentAvailability: async (agentId: number, date: string): Promise<AgentAvailability> => {
    const res = await apiRequest("GET", `/api/agents/${agentId}/availability?date=${date}`);
    return res.json();
  },
  
  /**
   * Find an available agent for a property on a specific date and time
   * @param propertyId Property ID
   * @param date Date string (YYYY-MM-DD)
   * @param preferredHour Preferred hour (0-23)
   * @returns Promise resolving to available agent
   */
  findAvailableAgent: async (propertyId: number, date: string, preferredHour?: number): Promise<Agent> => {
    let url = `/api/property-tours/find-agent/${propertyId}?date=${date}`;
    if (preferredHour !== undefined) {
      url += `&preferredHour=${preferredHour}`;
    }
    const res = await apiRequest("GET", url);
    return res.json();
  },
  
  /**
   * Generate time slots for a day (9:00 AM to 5:00 PM)
   * @param availableSlots Array of available time slots
   * @returns Array of time slots with availability status
   */
  generateTimeSlots: (availableSlots: string[] = []): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      const hourStr = `${hour}:00`;
      slots.push({
        time: hourStr,
        available: availableSlots.includes(hourStr)
      });
      
      if (hour < endHour) {
        const halfHourStr = `${hour}:30`;
        slots.push({
          time: halfHourStr,
          available: availableSlots.includes(halfHourStr)
        });
      }
    }
    
    return slots;
  },
  
  /**
   * Format time slots for display
   * @param timeSlot Time slot in 24h format (e.g., "14:30")
   * @returns Formatted time (e.g., "2:30 PM")
   */
  formatTimeSlot: (timeSlot: string): string => {
    const [hourStr, minuteStr] = timeSlot.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = minuteStr || '00';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  }
};