import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Mail, Phone, MapPin, Clock, AlertTriangle, Shield, Users, CreditCard, Home, Scale } from 'lucide-react';

export default function TermsOfServicePage() {
  const { t } = useTranslation(['common', 'legal']);
  const { currentLanguage } = useLanguage();

  const lastUpdated = "December 15, 2024";
  const effectiveDate = "January 1, 2025";
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <SEOHead
        title="Terms of Service | Inmobi - Legal Terms & Conditions"
        description="Read our comprehensive terms of service governing the use of Inmobi's real estate platform, including user responsibilities and platform policies."
        keywords="terms of service, legal terms, conditions, user agreement, real estate platform"
        canonical="/terms"
        type="article"
        locale={currentLanguage}
      />
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Scale className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            Legal terms and conditions governing your use of the Inmobi platform
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Badge variant="outline" className="flex items-center space-x-2 px-4 py-2">
              <FileText className="w-4 h-4 text-green-600" />
              <span>Legal Agreement</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-2 px-4 py-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Last Updated: {lastUpdated}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-2 px-4 py-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Effective: {effectiveDate}</span>
            </Badge>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-amber-900">
              <AlertTriangle className="w-5 h-5" />
              <span>Important Legal Notice</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-amber-800">
              By accessing or using Inmobi, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>
            <div className="bg-white border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">Key Points:</h4>
              <ul className="text-amber-800 text-sm space-y-1">
                <li>• These terms form a legally binding contract</li>
                <li>• You must be 18+ to use our services</li>
                <li>• EU and Mexico consumer protection laws apply</li>
                <li>• Changes require 30 days notice</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* 1. Agreement Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">1</span>
                <span>Agreement Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                These Terms of Service ("Terms") govern your access to and use of Inmobi's real estate platform, including our website, mobile applications, and related services ("Platform").
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Contracting Entity</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Inmobi S.L.</p>
                      <p>Registered in Barcelona, Spain</p>
                      <p>EU VAT: ES-B12345678</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>legal@inmobi.com</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Agreement Scope</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Use of our real estate search and listing platform</li>
                  <li>Communication tools and messaging systems</li>
                  <li>Payment processing for premium services</li>
                  <li>Mobile applications and related services</li>
                  <li>API access and third-party integrations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 2. Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">2</span>
                <span>Eligibility & Account Registration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Age Requirements</h4>
                  <p className="text-gray-700">
                    You must be at least 18 years old to use our Platform. If you are between 16-18 in the EU, you may use our services with parental consent.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Account Registration</h4>
                  <p className="text-gray-700 mb-3">
                    To access certain features, you must create an account by providing:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Valid email address</li>
                    <li>Accurate personal information</li>
                    <li>Secure password meeting our requirements</li>
                    <li>Verification through email or phone (where required)</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Account Security</h4>
                  <p className="text-blue-800">
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Platform Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">3</span>
                <span>Platform Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700">
                Inmobi provides the following services:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Home className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Property Listings</h4>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Search, browse, and view property listings for sale and rent
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Agent Connection</h4>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Connect with verified real estate agents and property owners
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">Premium Features</h4>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Enhanced listings, priority support, and advanced search tools
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Shield className="w-5 h-5 text-orange-600" />
                      <h4 className="font-semibold text-gray-900">Verification Services</h4>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Identity verification and property authentication
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Service Availability</h4>
                <p className="text-yellow-800">
                  Our services are primarily available in Spain and Mexico. Some features may be limited in other jurisdictions due to local regulations.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 4. User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">4</span>
                <span>User Responsibilities & Prohibited Uses</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">✅ You May:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Use our Platform for legitimate property search and rental purposes</li>
                  <li>Contact agents and property owners through our platform</li>
                  <li>Save favorite properties and create search alerts</li>
                  <li>Share property listings via social media or email</li>
                  <li>Provide honest reviews and feedback</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">❌ You May Not:</h4>
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h5 className="font-semibold text-red-900 mb-2">Fraudulent Activities</h5>
                    <ul className="list-disc list-inside text-red-800 text-sm space-y-1">
                      <li>Provide false or misleading information</li>
                      <li>Impersonate others or create fake accounts</li>
                      <li>Post fraudulent property listings</li>
                      <li>Engage in money laundering or financial fraud</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h5 className="font-semibold text-red-900 mb-2">Technical Misuse</h5>
                    <ul className="list-disc list-inside text-red-800 text-sm space-y-1">
                      <li>Scrape, crawl, or automated data collection</li>
                      <li>Reverse engineer our platform</li>
                      <li>Introduce viruses, malware, or harmful code</li>
                      <li>Attempt unauthorized access to our systems</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h5 className="font-semibold text-red-900 mb-2">Content Violations</h5>
                    <ul className="list-disc list-inside text-red-800 text-sm space-y-1">
                      <li>Post illegal, harmful, or offensive content</li>
                      <li>Violate intellectual property rights</li>
                      <li>Share discriminatory or harassing content</li>
                      <li>Spam or send unsolicited communications</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Property Listings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">5</span>
                <span>Property Listings & Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Listing Accuracy</h4>
                <p className="text-gray-700 mb-3">
                  All property listings must be accurate, current, and comply with local advertising laws. Property owners and agents are responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Providing truthful property descriptions and specifications</li>
                  <li>Using current, unedited photographs of the actual property</li>
                  <li>Disclosing all material defects and legal issues</li>
                  <li>Complying with fair housing and non-discrimination laws</li>
                  <li>Updating or removing listings when properties become unavailable</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Content Rights</h4>
                <p className="text-gray-700">
                  By posting content on our Platform, you grant Inmobi a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content for platform operation and marketing purposes.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🏠 Property Verification</h4>
                <p className="text-blue-800">
                  We may verify property listings and remove those that violate our standards. However, we are not responsible for the accuracy of third-party listings.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Payments & Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">6</span>
                <span>Payments, Fees & Refunds</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Premium Services</h4>
                <p className="text-gray-700 mb-3">
                  Some features require payment of fees. Current pricing is available on our website. Fees include:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Premium property listings with enhanced visibility</li>
                  <li>Advanced search and filtering tools</li>
                  <li>Priority customer support</li>
                  <li>API access for professional users</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Payment Terms</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-900">EU Consumer Rights</h5>
                    <ul className="text-green-800 text-sm space-y-1 mt-2">
                      <li>• 14-day cooling-off period for new subscriptions</li>
                      <li>• Right to cancel digital services with immediate effect</li>
                      <li>• Proportional refunds for unused subscription periods</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900">Payment Processing</h5>
                    <ul className="text-blue-800 text-sm space-y-1 mt-2">
                      <li>• Payments processed securely via Stripe</li>
                      <li>• Automatic billing for recurring subscriptions</li>
                      <li>• Email notifications before payment due dates</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Refund Policy</h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">Full refund if cancelled within 14 days (EU law)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">Proportional refund for technical issues on our end</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-red-600 mt-1">✗</span>
                    <span className="text-gray-700">No refund after 14 days unless required by law</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. Privacy & Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">7</span>
                <span>Privacy & Data Protection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Your privacy is important to us. Our data collection and processing practices are governed by our{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline font-medium">Privacy Policy</a>,
                which forms part of these Terms.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Your Rights</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Access your personal data</li>
                    <li>• Rectify inaccurate information</li>
                    <li>• Delete your account and data</li>
                    <li>• Data portability</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Our Commitments</h4>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• GDPR compliance</li>
                    <li>• Secure data storage</li>
                    <li>• Limited data collection</li>
                    <li>• Transparent processing</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">🍪 Cookies & Tracking</h4>
                <p className="text-purple-800">
                  We use cookies and similar technologies. See our{' '}
                  <a href="/cookies" className="underline">Cookie Policy</a> for details.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 8. Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">8</span>
                <span>Disclaimers & Limitations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-900 mb-3">⚠️ Important Disclaimers</h4>
                <div className="space-y-3 text-yellow-800">
                  <div>
                    <h5 className="font-semibold">Platform as Intermediary</h5>
                    <p className="text-sm">
                      Inmobi is a technology platform connecting users with property listings. We are not a real estate broker, agent, or property owner.
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold">No Warranty on Listings</h5>
                    <p className="text-sm">
                      We do not guarantee the accuracy, completeness, or availability of property listings. Always verify information independently.
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold">Third-Party Content</h5>
                    <p className="text-sm">
                      Property listings and agent profiles are provided by third parties. We are not responsible for their accuracy or quality.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Limitation of Liability</h4>
                <p className="text-gray-700 mb-3">
                  To the maximum extent permitted by law, Inmobi's liability is limited as follows:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Total liability limited to fees paid in the last 12 months</li>
                  <li>No liability for indirect, consequential, or punitive damages</li>
                  <li>No liability for business losses or lost profits</li>
                  <li>Consumer rights under EU/Mexico law remain unaffected</li>
                </ul>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">🚨 Platform Availability</h4>
                <p className="text-red-800">
                  We strive for 99.9% uptime but cannot guarantee uninterrupted service. Scheduled maintenance will be announced in advance.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 9. Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">9</span>
                <span>Account Termination</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Your Right to Terminate</h4>
                <p className="text-gray-700 mb-3">
                  You may terminate your account at any time by:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Using the account deletion option in settings</li>
                  <li>Contacting our support team at support@inmobi.com</li>
                  <li>Following the unsubscribe process for paid services</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Our Right to Terminate</h4>
                <p className="text-gray-700 mb-3">
                  We may suspend or terminate your account for:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Violation of these Terms or our policies</li>
                  <li>Fraudulent or illegal activities</li>
                  <li>Non-payment of fees for premium services</li>
                  <li>Extended inactivity (12+ months with notice)</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📧 Termination Process</h4>
                <p className="text-blue-800">
                  We will provide 30 days notice before termination unless immediate action is required for security or legal reasons.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 10. Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">10</span>
                <span>Governing Law & Disputes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Applicable Law</h4>
                <p className="text-gray-700">
                  These Terms are governed by and construed in accordance with the laws of Spain. EU consumer protection regulations apply to EU residents.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Dispute Resolution</h4>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-900">Step 1: Direct Contact</h5>
                    <p className="text-green-800 text-sm mt-1">
                      Contact us at legal@inmobi.com to resolve disputes informally
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900">Step 2: EU Mediation</h5>
                    <p className="text-blue-800 text-sm mt-1">
                      EU consumers may use the EU Online Dispute Resolution platform
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-900">Step 3: Courts</h5>
                    <p className="text-purple-800 text-sm mt-1">
                      Courts of Barcelona, Spain have jurisdiction (EU consumers may sue in their home country)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 11. Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">11</span>
                <span>Changes to These Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We may update these Terms from time to time. When we make material changes:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">30 Days Notice</h4>
                    <p className="text-gray-700">We'll notify you at least 30 days before changes take effect</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Notification</h4>
                    <p className="text-gray-700">Important changes will be sent to your registered email</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Right to Object</h4>
                    <p className="text-gray-700">You may terminate your account if you disagree with changes</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">📅 Version History</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Current Version:</span>
                    <span>{lastUpdated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Effective Date:</span>
                    <span>{effectiveDate}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 12. Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">12</span>
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                For questions about these Terms of Service, please contact us:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Legal Inquiries</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>legal@inmobi.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>+34 123 456 789</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">General Support</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>support@inmobi.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Mon-Fri 9:00-18:00 CET</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-green-900 mb-4">
              Questions About Our Terms?
            </h3>
            <p className="text-green-800 mb-6">
              Our legal team is here to help clarify any questions about these terms.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a 
                href="mailto:legal@inmobi.com"
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Legal Team</span>
              </a>
              <a 
                href="/privacy"
                className="inline-flex items-center space-x-2 bg-white text-green-600 border border-green-300 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Privacy Policy</span>
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}