import React from 'react';
import { useTranslation } from 'react-i18next';
import AddToCalendarButton, { CalendarEvent } from './AddToCalendarButton';

const CalendarTestDemo: React.FC = () => {
  const { t } = useTranslation(['common', 'calendar']);

  // Sample property tour event
  const propertyTourEvent: CalendarEvent = {
    title: 'Property Tour - Modern 3BR Apartment',
    description: `Property Tour Details:
- Property: Modern 3-bedroom apartment with stunning city views
- Agent: Sarah Johnson
- Tour Type: In-person viewing
- Duration: 45 minutes
- Please bring ID and any questions you may have

Contact: sarah.johnson@inmobimobi.com
Phone: +44 20 7123 4567`,
    location: '123 Baker Street, London, UK W1U 6TU',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // +45 minutes
    organizer: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@inmobimobi.com'
    },
    attendees: [
      {
        name: 'John Doe',
        email: 'john.doe@example.com'
      }
    ]
  };

  // Sample business meeting event
  const businessMeetingEvent: CalendarEvent = {
    title: 'Real Estate Consultation - Investment Portfolio Review',
    description: `Investment Consultation Meeting:
- Consultant: Michael Brown, Senior Investment Advisor
- Meeting Type: Portfolio Review & Strategy Discussion
- Duration: 60 minutes
- Agenda: Review current investments, discuss new opportunities, market analysis

Preparation: Please bring recent portfolio statements and investment goals

Contact: michael.brown@inmobimobi.com
Phone: +44 20 7987 6543`,
    location: 'inmobimobi Office, 456 High Street, London, UK EC2A 4BX',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // +1 hour
    organizer: {
      name: 'Michael Brown',
      email: 'michael.brown@inmobimobi.com'
    },
    attendees: [
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com'
      }
    ]
  };

  // Sample virtual tour event
  const virtualTourEvent: CalendarEvent = {
    title: 'Virtual Property Tour - Luxury Penthouse',
    description: `Virtual Property Tour:
- Property: Luxury 4-bedroom penthouse with panoramic city views
- Agent: Emma Wilson
- Tour Type: Virtual Reality Tour via Zoom
- Duration: 30 minutes
- Technology: VR-enabled 360° tour with live commentary

Zoom Meeting ID: 123-456-7890
Passcode: property2024

Contact: emma.wilson@inmobimobi.com
Phone: +44 20 7555 1234`,
    location: 'Virtual Tour - Zoom Meeting',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // +30 minutes
    organizer: {
      name: 'Emma Wilson',
      email: 'emma.wilson@inmobimobi.com'
    },
    attendees: [
      {
        name: 'Robert Johnson',
        email: 'robert.johnson@example.com'
      }
    ]
  };

  const formatEventTime = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('calendar:addToCalendar')} Demo
        </h1>
        <p className="text-lg text-gray-600">
          Test the calendar integration with different event types and calendar providers
        </p>
      </div>

      {/* Property Tour Example */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              🏠 Property Tour
            </h3>
            <p className="text-gray-600 mb-2">{propertyTourEvent.title}</p>
            <p className="text-sm text-gray-500 mb-2">
              📍 {propertyTourEvent.location}
            </p>
            <p className="text-sm text-gray-500">
              🕒 {formatEventTime(propertyTourEvent.startDate)}
            </p>
          </div>
          <div className="ml-4 space-y-2">
            <AddToCalendarButton 
              event={propertyTourEvent}
              variant="primary"
              size="md"
            />
            <AddToCalendarButton 
              event={propertyTourEvent}
              variant="outline"
              size="sm"
              dropdownPosition="left"
            />
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            {propertyTourEvent.description.split('\n')[0]}
          </p>
        </div>
      </div>

      {/* Business Meeting Example */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              💼 Business Meeting
            </h3>
            <p className="text-gray-600 mb-2">{businessMeetingEvent.title}</p>
            <p className="text-sm text-gray-500 mb-2">
              📍 {businessMeetingEvent.location}
            </p>
            <p className="text-sm text-gray-500">
              🕒 {formatEventTime(businessMeetingEvent.startDate)}
            </p>
          </div>
          <div className="ml-4 space-y-2">
            <AddToCalendarButton 
              event={businessMeetingEvent}
              variant="secondary"
              size="lg"
            />
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            {businessMeetingEvent.description.split('\n')[0]}
          </p>
        </div>
      </div>

      {/* Virtual Tour Example */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              💻 Virtual Tour
            </h3>
            <p className="text-gray-600 mb-2">{virtualTourEvent.title}</p>
            <p className="text-sm text-gray-500 mb-2">
              📍 {virtualTourEvent.location}
            </p>
            <p className="text-sm text-gray-500">
              🕒 {formatEventTime(virtualTourEvent.startDate)}
            </p>
          </div>
          <div className="ml-4 space-y-2">
            <AddToCalendarButton 
              event={virtualTourEvent}
              variant="outline"
              size="md"
              dropdownPosition="left"
            />
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            {virtualTourEvent.description.split('\n')[0]}
          </p>
        </div>
      </div>

      {/* Integration Examples */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          🔧 Integration Examples
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Supported Calendar Providers:</h4>
            <ul className="text-sm text-blue-700 space-y-1 ml-4">
              <li>• Google Calendar (web)</li>
              <li>• Outlook Calendar (web)</li>
              <li>• Office 365 (web)</li>
              <li>• Yahoo Calendar (web)</li>
              <li>• Apple Calendar (via .ics download)</li>
              <li>• Any calendar app supporting .ics files</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Usage in Components:</h4>
            <div className="bg-white rounded p-3 text-sm font-mono text-gray-700">
              {`import AddToCalendarButton from './calendar/AddToCalendarButton';

<AddToCalendarButton 
  event={{
    title: "Property Tour",
    startDate: new Date(),
    endDate: new Date(Date.now() + 3600000),
    location: "123 Main St",
    description: "Property viewing"
  }}
  variant="primary"
  size="md"
/>`}
            </div>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-4">
          ✅ Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="text-sm text-green-700 space-y-2">
            <li>✓ Multi-provider calendar support</li>
            <li>✓ Automatic timezone handling</li>
            <li>✓ .ics file generation & download</li>
            <li>✓ Event details with organizer/attendees</li>
            <li>✓ Responsive dropdown positioning</li>
            <li>✓ Customizable button variants & sizes</li>
          </ul>
          <ul className="text-sm text-green-700 space-y-2">
            <li>✓ TypeScript support</li>
            <li>✓ Internationalization ready</li>
            <li>✓ Accessibility compliant</li>
            <li>✓ Mobile-friendly interface</li>
            <li>✓ Zero external dependencies</li>
            <li>✓ Compatible with existing calendar system</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CalendarTestDemo;