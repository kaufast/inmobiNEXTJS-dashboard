import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  FileText, 
  User, 
  Shield, 
  Edit, 
  CheckCircle,
  Mail,
  Phone,
  Globe,
  CreditCard,
  Users
} from 'lucide-react';

interface AgencyStepReviewProps {
  wizard: {
    data: any;
    goToStep: (step: string) => void;
  };
}

export function AgencyStepReview({ wizard }: AgencyStepReviewProps) {
  const { data } = wizard;

  const ReviewSection = ({ 
    icon: Icon, 
    title, 
    step, 
    children 
  }: { 
    icon: any; 
    title: string; 
    step: string; 
    children: React.ReactNode; 
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Icon className="w-5 h-5" />
            <span>{title}</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => wizard.goToStep(step)}
            className="flex items-center space-x-1"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Application</h2>
        <p className="text-gray-600">
          Please review all information carefully before submitting your agency registration.
        </p>
      </div>

      {/* Agency Information */}
      <ReviewSection icon={Building2} title="Agency Information" step="agency-info">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {data.agencyLogo && (
              <img
                src={data.agencyLogo}
                alt="Agency logo"
                className="w-12 h-12 object-cover rounded-lg border"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{data.agencyName}</h3>
              <p className="text-sm text-gray-500">Real Estate Agency</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-900">{data.agencyEmail}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-900">{data.agencyPhone}</span>
            </div>
            {data.agencyWebsite && (
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <a 
                  href={data.agencyWebsite} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {data.agencyWebsite}
                </a>
              </div>
            )}
          </div>
        </div>
      </ReviewSection>

      {/* Location */}
      <ReviewSection icon={MapPin} title="Agency Location" step="location">
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-gray-500 mt-1" />
          <div>
            <p className="text-gray-900 font-medium">
              {data.address}
            </p>
            <p className="text-gray-600">
              {data.city}, {data.state} {data.postalCode}
            </p>
            <p className="text-gray-500 text-sm">
              {data.country}
            </p>
          </div>
        </div>
      </ReviewSection>

      {/* Business Details */}
      <ReviewSection icon={FileText} title="Business Details" step="business-details">
        <div className="space-y-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">License Number</span>
            </div>
            <p className="text-gray-600 ml-6">{data.licenseNumber}</p>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">Business Description</span>
            </div>
            <p className="text-gray-600 ml-6 text-sm leading-relaxed">
              {data.businessDescription}
            </p>
          </div>
        </div>
      </ReviewSection>

      {/* Admin Setup */}
      <ReviewSection icon={User} title="Administrator Account" step="admin-setup">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                {data.adminFirstName} {data.adminLastName}
              </h4>
              <p className="text-sm text-gray-500">Agency Administrator</p>
            </div>
          </div>
          
          <div className="ml-13">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-900">{data.adminEmail}</span>
            </div>
          </div>
          
          <div className="ml-13">
            <Badge variant="secondary" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Full Admin Access
            </Badge>
          </div>
        </div>
      </ReviewSection>

      {/* Verification */}
      <ReviewSection icon={Shield} title="Verification & Terms" step="verification">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Uploaded Documents</h4>
            <div className="space-y-2">
              {(data.verificationDocuments || []).map((doc: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">{doc.name}</span>
                </div>
              ))}
            </div>
            {(!data.verificationDocuments || data.verificationDocuments.length === 0) && (
              <p className="text-sm text-red-600">No documents uploaded</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700">Terms & Conditions Accepted</span>
          </div>
        </div>
      </ReviewSection>

      {/* Submission Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Ready to Submit
              </h3>
              <p className="text-blue-700 mb-4">
                By submitting this application, you're requesting to join our network of professional 
                real estate agencies. Our team will review your information and documents within 2-3 business days.
              </p>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">What happens next:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Document verification and license validation</li>
                  <li>• Background check and compliance review</li>
                  <li>• Email notification with approval status</li>
                  <li>• Account activation and platform access</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 