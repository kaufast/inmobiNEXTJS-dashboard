import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  Phone, 
  FileText, 
  Users,
  Settings,
  ArrowRight,
  Home
} from 'lucide-react';

interface AgencyStepCompletionProps {
  wizard: {
    data: any;
  };
}

export function AgencyStepCompletion({ wizard }: AgencyStepCompletionProps) {
  const { data } = wizard;

  const timelineItems = [
    {
      icon: CheckCircle,
      title: 'Application Submitted',
      description: 'Your agency registration has been successfully submitted',
      status: 'completed',
      time: 'Just now'
    },
    {
      icon: FileText,
      title: 'Document Review',
      description: 'Our team will verify your license and business documents',
      status: 'pending',
      time: '1-2 business days'
    },
    {
      icon: Phone,
      title: 'Verification Call',
      description: 'Quick verification call to confirm agency details',
      status: 'pending',
      time: '2-3 business days'
    },
    {
      icon: Mail,
      title: 'Approval Notification',
      description: 'Email confirmation with account activation instructions',
      status: 'pending',
      time: '2-3 business days'
    }
  ];

  const nextSteps = [
    {
      icon: Settings,
      title: 'Set Up Your Profile',
      description: 'Complete your agency profile and customize your branding'
    },
    {
      icon: Users,
      title: 'Add Your Team',
      description: 'Invite agents and staff members to join your agency account'
    },
    {
      icon: FileText,
      title: 'Create Listings',
      description: 'Start adding your property listings to the platform'
    }
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Application Successfully Submitted!
          </h1>
          
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Thank you for choosing InmobiMobi! Your agency registration for{' '}
            <span className="font-semibold text-gray-900">{data.agencyName}</span>{' '}
            has been submitted and is now under review.
          </p>
          
          <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Clock className="w-4 h-4 text-blue-500 mr-2" />
              Review time: 2-3 business days
            </span>
            <span className="flex items-center">
              <Mail className="w-4 h-4 text-blue-500 mr-2" />
              Updates sent to {data.adminEmail}
            </span>
          </div>
        </div>

        {/* Application Timeline */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Application Timeline</h2>
            <div className="space-y-6">
              {timelineItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    item.status === 'completed' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium ${
                        item.status === 'completed' ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {item.title}
                      </h3>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                    <p className={`text-sm ${
                      item.status === 'completed' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">What's Next?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {nextSteps.map((step, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <step.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Important Information</h2>
            <div className="space-y-3 text-sm text-blue-800">
              <p>
                <strong>Application Reference:</strong> A reference number has been sent to your email 
                ({data.adminEmail}) for tracking purposes.
              </p>
              <p>
                <strong>Required Action:</strong> Please monitor your email for any additional 
                documentation requests or verification steps.
              </p>
              <p>
                <strong>Questions?</strong> Our support team is available Monday-Friday, 9 AM - 6 PM EST 
                at <a href="mailto:support@inmobimobi.com" className="underline">support@inmobimobi.com</a> 
                or <a href="tel:+1-555-123-4567" className="underline">+1 (555) 123-4567</a>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.href = '/'}
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Homepage
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/login'}
            >
              Sign In
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            You can track your application status by signing in once your account is activated.
          </p>
        </div>
      </div>
    </div>
  );
} 