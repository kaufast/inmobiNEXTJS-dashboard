import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cookie, Settings, Shield, Eye, BarChart3, Target, Clock, Trash2, Download, RefreshCw } from 'lucide-react';
import { useUsercentrics } from '@/hooks/use-usercentrics';

export default function CookiePolicyPage() {
  const { t } = useTranslation(['common', 'privacy']);
  const { currentLanguage } = useLanguage();
  const { showPrivacySettings, consentStatus, isInitialized } = useUsercentrics();

  const lastUpdated = "December 15, 2024";
  
  const handleManageCookies = () => {
    if (showPrivacySettings) {
      showPrivacySettings();
    }
  };

  const cookieCategories = [
    {
      id: 'necessary',
      name: 'Strictly Necessary Cookies',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      required: true,
      description: 'Essential for website functionality and security',
      examples: [
        'Authentication tokens',
        'Session management',
        'CSRF protection',
        'Load balancing'
      ],
      retention: 'Session or 1 year maximum',
      legal: 'No consent required (Article 6(1)(f) GDPR)'
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      icon: Settings,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      required: false,
      description: 'Enable enhanced features and personalization',
      examples: [
        'Language preferences',
        'Search filters',
        'Saved properties',
        'Map settings'
      ],
      retention: '1-2 years',
      legal: 'Consent required under ePrivacy Directive'
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      required: false,
      description: 'Help us understand how visitors use our website',
      examples: [
        'Google Analytics',
        'Hotjar heatmaps',
        'Performance monitoring',
        'Error tracking'
      ],
      retention: '26 months (GA4 default)',
      legal: 'Consent required under GDPR and ePrivacy'
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      required: false,
      description: 'Used for advertising and personalized content',
      examples: [
        'Facebook Pixel',
        'Google Ads',
        'Retargeting pixels',
        'Social media widgets'
      ],
      retention: '90 days to 2 years',
      legal: 'Explicit consent required under GDPR'
    }
  ];

  const thirdPartyServices = [
    {
      name: 'Google Analytics',
      category: 'Analytics',
      purpose: 'Website usage statistics and user behavior analysis',
      cookies: '_ga, _ga_*, _gid, _gat',
      privacy: 'https://policies.google.com/privacy',
      optOut: 'https://tools.google.com/dlpage/gaoptout'
    },
    {
      name: 'Google Maps',
      category: 'Functional',
      purpose: 'Interactive maps for property locations',
      cookies: 'NID, CONSENT, DV',
      privacy: 'https://policies.google.com/privacy',
      optOut: 'Through our cookie settings'
    },
    {
      name: 'Facebook Pixel',
      category: 'Marketing',
      purpose: 'Track conversions and optimize ad campaigns',
      cookies: '_fbp, _fbc, fr',
      privacy: 'https://www.facebook.com/privacy/policy',
      optOut: 'Through our cookie settings'
    },
    {
      name: 'Hotjar',
      category: 'Analytics',
      purpose: 'User session recordings and heatmaps',
      cookies: '_hjid, _hjFirstSeen, _hjSession*',
      privacy: 'https://www.hotjar.com/legal/policies/privacy',
      optOut: 'https://www.hotjar.com/legal/compliance/opt-out'
    },
    {
      name: 'Stripe',
      category: 'Necessary',
      purpose: 'Secure payment processing',
      cookies: '__stripe_mid, __stripe_sid',
      privacy: 'https://stripe.com/privacy',
      optOut: 'Cannot be disabled (payment functionality)'
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <SEOHead
        title="Cookie Policy | Inmobi - How We Use Cookies"
        description="Learn about how Inmobi uses cookies and similar technologies, your cookie choices, and how to manage your preferences in compliance with GDPR."
        keywords="cookie policy, cookies, tracking, GDPR, privacy, data protection"
        canonical="/cookies"
        type="article"
        locale={currentLanguage}
      />
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Cookie className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Cookie Policy
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            Learn how we use cookies and similar technologies to improve your experience
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Badge variant="outline" className="flex items-center space-x-2 px-4 py-2">
              <Cookie className="w-4 h-4 text-orange-600" />
              <span>GDPR Compliant</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-2 px-4 py-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Last Updated: {lastUpdated}</span>
            </Badge>
            {isInitialized && (
              <Badge variant="outline" className="flex items-center space-x-2 px-4 py-2">
                <Eye className="w-4 h-4 text-green-600" />
                <span>ConsentManager Active</span>
              </Badge>
            )}
          </div>

          {/* Cookie Management CTA */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              🍪 Manage Your Cookie Preferences
            </h3>
            <p className="text-blue-800 mb-4">
              You can customize which cookies we use at any time
            </p>
            <Button 
              onClick={handleManageCookies}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!isInitialized}
            >
              <Settings className="w-4 h-4 mr-2" />
              Cookie Settings
            </Button>
          </div>
        </div>

        {/* Current Consent Status */}
        {consentStatus && (
          <Card className="mb-8 bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Eye className="w-5 h-5" />
                <span>Your Current Cookie Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    consentStatus.categories.necessary ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Shield className={`w-6 h-6 ${
                      consentStatus.categories.necessary ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-sm font-medium text-gray-900">Necessary</div>
                  <div className={`text-xs ${
                    consentStatus.categories.necessary ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {consentStatus.categories.necessary ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    consentStatus.categories.functional ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Settings className={`w-6 h-6 ${
                      consentStatus.categories.functional ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-sm font-medium text-gray-900">Functional</div>
                  <div className={`text-xs ${
                    consentStatus.categories.functional ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {consentStatus.categories.functional ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    consentStatus.categories.analytics ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <BarChart3 className={`w-6 h-6 ${
                      consentStatus.categories.analytics ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-sm font-medium text-gray-900">Analytics</div>
                  <div className={`text-xs ${
                    consentStatus.categories.analytics ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {consentStatus.categories.analytics ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    consentStatus.categories.marketing ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    <Target className={`w-6 h-6 ${
                      consentStatus.categories.marketing ? 'text-orange-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-sm font-medium text-gray-900">Marketing</div>
                  <div className={`text-xs ${
                    consentStatus.categories.marketing ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    {consentStatus.categories.marketing ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {/* 1. What Are Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">1</span>
                <span>What Are Cookies?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our platform.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">🍪 First-Party Cookies</h4>
                  <p className="text-blue-800 text-sm">
                    Set directly by Inmobi for essential functionality and features
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">🌐 Third-Party Cookies</h4>
                  <p className="text-purple-800 text-sm">
                    Set by external services like analytics and advertising providers
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">⏱️ Session Cookies</h4>
                  <p className="text-green-800 text-sm">
                    Temporary cookies that expire when you close your browser
                  </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">💾 Persistent Cookies</h4>
                  <p className="text-yellow-800 text-sm">
                    Remain on your device until they expire or you delete them
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Cookie Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">2</span>
                <span>Types of Cookies We Use</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {cookieCategories.map((category) => (
                <div 
                  key={category.id} 
                  className={`border rounded-xl p-6 ${category.borderColor} ${category.bgColor}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <category.icon className={`w-6 h-6 ${category.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-gray-600 text-sm">{category.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={category.required ? "default" : "secondary"}
                      className={category.required ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700"}
                    >
                      {category.required ? "Required" : "Optional"}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Examples</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {category.examples.map((example, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Retention Period</h4>
                      <p className="text-sm text-gray-700">{category.retention}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Legal Basis</h4>
                      <p className="text-sm text-gray-700">{category.legal}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 3. Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">3</span>
                <span>Third-Party Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We use trusted third-party services that may set their own cookies. Here's a complete list:
              </p>
              
              <div className="space-y-4">
                {thirdPartyServices.map((service, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{service.name}</h4>
                        <Badge variant="outline" className="mt-1">
                          {service.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Purpose</h5>
                        <p className="text-gray-700">{service.purpose}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Cookie Names</h5>
                        <p className="text-gray-700 font-mono text-xs">{service.cookies}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Privacy Policy</h5>
                        <a 
                          href={service.privacy} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          View Policy
                        </a>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Opt-Out</h5>
                        {service.optOut.startsWith('http') ? (
                          <a 
                            href={service.optOut} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Opt-Out Link
                          </a>
                        ) : (
                          <span className="text-gray-700">{service.optOut}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. Your Rights and Choices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">4</span>
                <span>Your Cookie Rights & Choices</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700">
                Under GDPR and ePrivacy laws, you have several rights regarding cookies:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Consent Management</span>
                    </h4>
                    <p className="text-green-800 text-sm mb-3">
                      Accept or reject non-essential cookies through our consent banner
                    </p>
                    <Button 
                      onClick={handleManageCookies}
                      size="sm"
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-100"
                      disabled={!isInitialized}
                    >
                      Manage Preferences
                    </Button>
                  </div>
                  
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>Withdraw Consent</span>
                    </h4>
                    <p className="text-blue-800 text-sm">
                      Change your mind anytime by updating your cookie preferences
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                    <h4 className="font-semibold text-purple-900 mb-2 flex items-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Browser Controls</span>
                    </h4>
                    <p className="text-purple-800 text-sm">
                      Delete existing cookies and block future ones through browser settings
                    </p>
                  </div>
                  
                  <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Data Access</span>
                    </h4>
                    <p className="text-orange-800 text-sm">
                      Request information about cookies stored on your device
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-900 mb-3">⚠️ Impact of Blocking Cookies</h4>
                <p className="text-yellow-800 mb-3">
                  Disabling certain cookies may affect your experience:
                </p>
                <ul className="text-yellow-800 text-sm space-y-1">
                  <li>• <strong>Functional cookies:</strong> Some features may not work properly</li>
                  <li>• <strong>Analytics cookies:</strong> We can't improve our service based on usage data</li>
                  <li>• <strong>Marketing cookies:</strong> You may see less relevant advertising</li>
                  <li>• <strong>Necessary cookies:</strong> Cannot be disabled without breaking core functionality</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 5. Browser Cookie Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">5</span>
                <span>Browser Cookie Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                You can also manage cookies directly in your browser settings:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Google Chrome</h4>
                    <p className="text-gray-700 text-sm">Settings → Privacy and security → Cookies and other site data</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Mozilla Firefox</h4>
                    <p className="text-gray-700 text-sm">Options → Privacy & Security → Cookies and Site Data</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Safari</h4>
                    <p className="text-gray-700 text-sm">Preferences → Privacy → Manage Website Data</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Microsoft Edge</h4>
                    <p className="text-gray-700 text-sm">Settings → Cookies and site permissions → Cookies and site data</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. Cookie Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">6</span>
                <span>Updates to This Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We may update this Cookie Policy to reflect changes in our practices or legal requirements. When we do:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Update Notification</h4>
                    <p className="text-gray-700">We'll update the "Last Updated" date at the top of this page</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Settings className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Consent Refresh</h4>
                    <p className="text-gray-700">For significant changes, we may ask you to review your consent preferences</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Eye className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Regular Review</h4>
                    <p className="text-gray-700">Please check this page periodically for any updates</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">7</span>
                <span>Questions About Cookies?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                If you have questions about our use of cookies or this policy, please contact us:
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Data Protection Officer</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">📧 Email:</span>
                    <a href="mailto:dpo@inmobi.com" className="text-blue-600 hover:text-blue-800 underline">
                      dpo@inmobi.com
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">📞 Phone:</span>
                    <span>+34 123 456 789</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">📍 Address:</span>
                    <span>Inmobi S.L., Barcelona, Spain</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-orange-900 mb-4">
              Take Control of Your Cookies
            </h3>
            <p className="text-orange-800 mb-6">
              Customize your cookie preferences to match your privacy needs
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button 
                onClick={handleManageCookies}
                className="bg-orange-600 hover:bg-orange-700 text-white"
                disabled={!isInitialized}
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Cookie Settings
              </Button>
              <a 
                href="/privacy"
                className="inline-flex items-center space-x-2 bg-white text-orange-600 border border-orange-300 px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors"
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