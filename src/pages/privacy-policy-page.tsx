import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Mail, Phone, MapPin, Clock, User, Eye, Lock, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation(['common', 'privacy']);
  const { currentLanguage } = useLanguage();

  const lastUpdated = "December 15, 2024";
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <SEOHead
        title="Privacy Policy | Inmobi - GDPR Compliant Data Protection"
        description="Our comprehensive privacy policy explains how Inmobi collects, uses, and protects your personal data in compliance with GDPR and data protection laws."
        keywords="privacy policy, GDPR, data protection, personal data, cookies, real estate"
        canonical="/privacy"
        type="article"
        locale={currentLanguage}
      />
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            Your privacy matters to us. This policy explains how we collect, use, and protect your personal data.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Badge variant="outline" className="flex items-center space-x-2 px-4 py-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>GDPR Compliant</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-2 px-4 py-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Last Updated: {lastUpdated}</span>
            </Badge>
          </div>
        </div>

        {/* Quick Summary */}
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <Eye className="w-5 h-5" />
              <span>Privacy at a Glance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Data We Collect</h4>
                  <p className="text-sm text-blue-700">Contact info, preferences, property searches</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">How We Protect It</h4>
                  <p className="text-sm text-blue-700">Encryption, secure servers, limited access</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Your Rights</h4>
                  <p className="text-sm text-blue-700">Access, rectify, delete, or port your data</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* 1. Data Controller */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">1</span>
                <span>Data Controller</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                The data controller responsible for your personal data is:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Inmobi Real Estate Platform</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>Barcelona, Spain & Mexico City, Mexico</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>privacy@inmobi.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>+34 123 456 789</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Data We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">2</span>
                <span>Personal Data We Collect</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700">
                We collect and process the following types of personal data:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Account Information</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Name, email address, phone number</li>
                    <li>Profile picture and preferences</li>
                    <li>Account creation date and login history</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Property & Search Data</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Property search criteria and saved searches</li>
                    <li>Property listings viewed and favorited</li>
                    <li>Location preferences and search history</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Communication Data</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Messages with agents and property owners</li>
                    <li>Support tickets and feedback</li>
                    <li>Newsletter and marketing preferences</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Technical Data</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>IP address, browser type, device information</li>
                    <li>Cookies and usage analytics</li>
                    <li>Performance and error logs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Legal Basis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">3</span>
                <span>Legal Basis for Processing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Under GDPR Article 6, we process your personal data based on:
              </p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Contract Performance (Art. 6(1)(b))</h4>
                  <p className="text-gray-700">To provide our property search and rental services</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Legitimate Interest (Art. 6(1)(f))</h4>
                  <p className="text-gray-700">Analytics, fraud prevention, and service improvement</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Consent (Art. 6(1)(a))</h4>
                  <p className="text-gray-700">Marketing communications and non-essential cookies</p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Legal Obligation (Art. 6(1)(c))</h4>
                  <p className="text-gray-700">Tax reporting and anti-money laundering compliance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. How We Use Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">4</span>
                <span>How We Use Your Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Service Provision</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Property search and recommendations</li>
                    <li>• Account management</li>
                    <li>• Communication with agents</li>
                    <li>• Payment processing</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Service Improvement</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Analytics and usage insights</li>
                    <li>• Personalized recommendations</li>
                    <li>• Technical support</li>
                    <li>• Platform optimization</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Marketing (with consent)</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Newsletter and updates</li>
                    <li>• Promotional offers</li>
                    <li>• Market insights</li>
                    <li>• Event invitations</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Legal Compliance</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Fraud prevention</li>
                    <li>• Regulatory reporting</li>
                    <li>• Security monitoring</li>
                    <li>• Dispute resolution</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">5</span>
                <span>Data Sharing and Recipients</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We may share your personal data with the following categories of recipients:
              </p>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">⚠️ We Never Sell Your Data</h4>
                  <p className="text-red-800">We do not sell, rent, or trade your personal data to third parties for their marketing purposes.</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">Service Providers</h4>
                    <p className="text-gray-700">Cloud hosting, email services, payment processors, analytics providers</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">Property Agents & Landlords</h4>
                    <p className="text-gray-700">Contact information when you inquire about properties</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">Legal Authorities</h4>
                    <p className="text-gray-700">When required by law or to protect our rights</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">Business Transfers</h4>
                    <p className="text-gray-700">In case of merger, acquisition, or asset sale</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. International Transfers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">6</span>
                <span>International Data Transfers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Your data may be transferred to and processed in countries outside the European Economic Area (EEA). We ensure adequate protection through:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Adequacy Decisions</h4>
                    <p className="text-gray-700">Transfers to countries with adequate data protection levels</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Standard Contractual Clauses</h4>
                    <p className="text-gray-700">EU-approved contracts for secure data transfers</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Additional Safeguards</h4>
                    <p className="text-gray-700">Encryption, access controls, and regular audits</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">7</span>
                <span>Data Retention</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We retain your personal data only as long as necessary for the purposes outlined in this policy:
              </p>
              
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Account Data</h4>
                  <p className="text-gray-700">Until account deletion + 1 year for legal compliance</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Communication Records</h4>
                  <p className="text-gray-700">3 years after last contact for dispute resolution</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Analytics Data</h4>
                  <p className="text-gray-700">26 months in aggregated, anonymized form</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Marketing Data</h4>
                  <p className="text-gray-700">Until consent withdrawal + 30 days for processing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 8. Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">8</span>
                <span>Your GDPR Rights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700">
                Under GDPR, you have the following rights regarding your personal data:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">🔍 Right of Access</h4>
                    <p className="text-gray-700 text-sm">Request a copy of all personal data we hold about you</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">✏️ Right of Rectification</h4>
                    <p className="text-gray-700 text-sm">Correct inaccurate or incomplete personal data</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">🗑️ Right of Erasure</h4>
                    <p className="text-gray-700 text-sm">Request deletion of your personal data ("right to be forgotten")</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">⏸️ Right to Restrict Processing</h4>
                    <p className="text-gray-700 text-sm">Limit how we use your personal data</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">📦 Right to Data Portability</h4>
                    <p className="text-gray-700 text-sm">Receive your data in a machine-readable format</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">❌ Right to Object</h4>
                    <p className="text-gray-700 text-sm">Object to processing based on legitimate interest</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">🤖 Automated Decision-Making</h4>
                    <p className="text-gray-700 text-sm">Opt out of automated decision-making and profiling</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">✋ Right to Withdraw Consent</h4>
                    <p className="text-gray-700 text-sm">Withdraw consent for marketing or cookies anytime</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">📧 How to Exercise Your Rights</h4>
                <p className="text-blue-800 mb-3">
                  To exercise any of these rights, contact us at:
                </p>
                <div className="space-y-2 text-blue-800">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>privacy@inmobi.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>We respond within 30 days</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 9. Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">9</span>
                <span>Cookies and Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We use cookies and similar technologies to improve your experience. See our detailed{' '}
                <a href="/cookies" className="text-blue-600 hover:text-blue-800 underline">Cookie Policy</a>{' '}
                for more information.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Essential Cookies</h4>
                  <p className="text-green-800 text-sm">Required for website functionality - no consent needed</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Analytics Cookies</h4>
                  <p className="text-blue-800 text-sm">Help us understand how you use our site - consent required</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Marketing Cookies</h4>
                  <p className="text-purple-800 text-sm">Used for personalized advertising - consent required</p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Functional Cookies</h4>
                  <p className="text-yellow-800 text-sm">Enhance website features - consent required</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 10. Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">10</span>
                <span>Data Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We implement appropriate technical and organizational measures to protect your personal data:
              </p>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Technical Safeguards</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• SSL/TLS encryption in transit</li>
                      <li>• AES-256 encryption at rest</li>
                      <li>• Regular security updates</li>
                      <li>• Vulnerability assessments</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Organizational Measures</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• Staff training on data protection</li>
                      <li>• Access controls and authentication</li>
                      <li>• Regular security audits</li>
                      <li>• Incident response procedures</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">🚨 Data Breach Notification</h4>
                  <p className="text-red-800">
                    In case of a data breach, we will notify you and relevant authorities within 72 hours as required by GDPR.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 11. Contact & Complaints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">11</span>
                <span>Contact & Complaints</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">📞 Contact Our Data Protection Officer</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>dpo@inmobi.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>+34 123 456 789</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>Inmobi DPO, Barcelona, Spain</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">🏛️ Supervisory Authority</h4>
                <p className="text-gray-700 mb-3">
                  If you're not satisfied with our response, you can lodge a complaint with your local data protection authority:
                </p>
                <div className="space-y-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900">Spain (AEPD)</h5>
                    <p className="text-blue-800 text-sm">Spanish Data Protection Agency</p>
                    <p className="text-blue-800 text-sm">Website: www.aepd.es</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900">Mexico (INAI)</h5>
                    <p className="text-blue-800 text-sm">National Institute for Transparency</p>
                    <p className="text-blue-800 text-sm">Website: www.inai.org.mx</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 12. Changes to Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">12</span>
                <span>Changes to This Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. When we do:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">We'll update the "Last Updated" date</h4>
                    <p className="text-gray-700">Currently: {lastUpdated}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Email notification for significant changes</h4>
                    <p className="text-gray-700">We'll notify you of material changes that affect your rights</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Eye className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Review regularly</h4>
                    <p className="text-gray-700">Please check this page periodically for updates</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Questions About Your Privacy?
            </h3>
            <p className="text-blue-800 mb-6">
              We're here to help you understand how we protect your data.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a 
                href="mailto:privacy@inmobi.com"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Privacy Team</span>
              </a>
              <a 
                href="/cookies"
                className="inline-flex items-center space-x-2 bg-white text-blue-600 border border-blue-300 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Cookie Policy</span>
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}