import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Users, Shield, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

interface AgencyStepWelcomeProps {
  wizard: {
    goToNext: () => void;
  };
}

export function AgencyStepWelcome({ wizard }: AgencyStepWelcomeProps) {
  const benefits = [
    {
      icon: Building2,
      title: 'Professional Platform',
      description: 'Access to our comprehensive real estate management system with advanced tools and analytics.'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Manage your agents, assign roles, and track performance with our built-in team management tools.'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with full compliance to real estate industry standards and regulations.'
    },
    {
      icon: TrendingUp,
      title: 'Growth Tools',
      description: 'Marketing automation, lead generation, and client management tools to grow your business.'
    }
  ];

  const features = [
    'Property listing management',
    'Lead tracking and CRM',
    'Agent performance analytics',
    'Client communication tools',
    'Transaction management',
    'Marketing automation',
    'Custom branding options',
    'API integrations'
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to InmobiMobi Agency Network
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of successful real estate agencies using our platform to streamline operations, 
            increase sales, and provide exceptional client experiences.
          </p>
          
          <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Free 30-day trial
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              No setup fees
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              24/7 support
            </span>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Features List */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Everything you need to succeed
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The registration process takes just a few minutes. Let's set up your agency profile 
            and get you connected to our network.
          </p>
          
          <Button 
            onClick={wizard.goToNext}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            Already have an account? <a href="/login" className="text-blue-600 hover:underline">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  );
} 