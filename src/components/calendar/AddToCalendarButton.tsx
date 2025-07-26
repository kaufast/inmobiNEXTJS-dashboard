import React, { useState } from 'react';
import { Calendar, ChevronDown, Download, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  organizer?: {
    name: string;
    email: string;
  };
  attendees?: Array<{
    name: string;
    email: string;
  }>;
}

interface AddToCalendarButtonProps {
  event: CalendarEvent;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  dropdownPosition?: 'left' | 'right';
}

const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({
  event,
  className = '',
  variant = 'primary',
  size = 'md',
  showIcon = true,
  dropdownPosition = 'right'
}) => {
  const { t } = useTranslation(['common', 'calendar']);
  const [isOpen, setIsOpen] = useState(false);

  // Format date for different calendar providers
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Generate .ics file content
  const generateICS = (): string => {
    const startDate = formatDate(event.startDate);
    const endDate = formatDate(event.endDate);
    const now = formatDate(new Date());
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//inmobimobi//Calendar//EN',
      'BEGIN:VEVENT',
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `DTSTAMP:${now}`,
      `UID:${Date.now()}@inmobimobi.com`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
      event.location ? `LOCATION:${event.location}` : '',
      event.organizer ? `ORGANIZER;CN=${event.organizer.name}:mailto:${event.organizer.email}` : '',
      ...(event.attendees || []).map(attendee => 
        `ATTENDEE;CN=${attendee.name}:mailto:${attendee.email}`
      ),
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\n');

    return icsContent;
  };

  // Download .ics file
  const downloadICS = () => {
    try {
      console.log('Generating ICS file for event:', event.title);
      const icsContent = generateICS();
      console.log('ICS content generated:', icsContent.substring(0, 200) + '...');
      
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('ICS file download initiated successfully');
      setIsOpen(false);
    } catch (error) {
      console.error('Error downloading ICS file:', error);
    }
  };

  // Generate URLs for different calendar providers
  const getCalendarUrls = () => {
    const startDate = event.startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = event.endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const baseParams = {
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: event.description || '',
      location: event.location || '',
    };

    return {
      google: `https://calendar.google.com/calendar/render?action=TEMPLATE&${new URLSearchParams({
        text: baseParams.text,
        dates: baseParams.dates,
        details: baseParams.details,
        location: baseParams.location,
      }).toString()}`,
      
      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams({
        subject: baseParams.text,
        startdt: event.startDate.toISOString(),
        enddt: event.endDate.toISOString(),
        body: baseParams.details,
        location: baseParams.location,
      }).toString()}`,
      
      office365: `https://outlook.office.com/calendar/0/deeplink/compose?${new URLSearchParams({
        subject: baseParams.text,
        startdt: event.startDate.toISOString(),
        enddt: event.endDate.toISOString(),
        body: baseParams.details,
        location: baseParams.location,
      }).toString()}`,
      
      yahoo: `https://calendar.yahoo.com/?${new URLSearchParams({
        v: '60',
        view: 'd',
        type: '20',
        title: baseParams.text,
        st: startDate,
        et: endDate,
        desc: baseParams.details,
        in_loc: baseParams.location,
      }).toString()}`,
    };
  };

  // Open calendar URL
  const openCalendar = (provider: keyof ReturnType<typeof getCalendarUrls>) => {
    try {
      const urls = getCalendarUrls();
      console.log(`Opening calendar provider: ${provider}`);
      console.log(`Calendar URL: ${urls[provider]}`);
      
      const opened = window.open(urls[provider], '_blank');
      if (!opened) {
        console.error('Failed to open calendar URL - popup blocked or error');
        // Fallback: try to navigate in same window
        window.location.href = urls[provider];
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error opening calendar:', error);
    }
  };

  // CSS classes based on variant and size
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 relative';
    
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-6 py-3 text-base rounded-lg',
    };
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  };

  const getDropdownClasses = () => {
    const baseClasses = 'absolute z-50 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2';
    const positionClasses = dropdownPosition === 'left' ? 'left-0' : 'right-0';
    return `${baseClasses} ${positionClasses}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={getButtonClasses()}
        type="button"
      >
        {showIcon && <Calendar className="w-4 h-4 mr-2" />}
        {t('calendar:addToCalendar')}
        <ChevronDown className="w-4 h-4 ml-1" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className={getDropdownClasses()}>
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{t('calendar:selectCalendarProvider')}</p>
              <p className="text-xs text-gray-500">{event.title}</p>
            </div>

            {/* Calendar Provider Options */}
            <div className="py-1">
              <button
                onClick={() => openCalendar('google')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="w-5 h-5 mr-3 bg-blue-500 rounded flex items-center justify-center">
                  <ExternalLink className="w-3 h-3 text-white" />
                </div>
                {t('calendar:googleCalendar')}
              </button>

              <button
                onClick={() => openCalendar('outlook')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="w-5 h-5 mr-3 bg-blue-600 rounded flex items-center justify-center">
                  <ExternalLink className="w-3 h-3 text-white" />
                </div>
                {t('calendar:outlookCalendar')}
              </button>

              <button
                onClick={() => openCalendar('office365')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="w-5 h-5 mr-3 bg-orange-500 rounded flex items-center justify-center">
                  <ExternalLink className="w-3 h-3 text-white" />
                </div>
                {t('calendar:office365Calendar')}
              </button>

              <button
                onClick={() => openCalendar('yahoo')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="w-5 h-5 mr-3 bg-purple-600 rounded flex items-center justify-center">
                  <ExternalLink className="w-3 h-3 text-white" />
                </div>
                {t('calendar:yahooCalendar')}
              </button>

              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={downloadICS}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-4 h-4 mr-3 text-gray-500" />
                  {t('calendar:downloadICS')}
                  <span className="ml-auto text-xs text-gray-400">(.ics)</span>
                </button>
              </div>
            </div>

            <div className="px-4 py-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {t('calendar:calendarNote')}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddToCalendarButton;