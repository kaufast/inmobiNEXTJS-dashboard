import React from 'react';
import BaseLayout from '@/components/layout/BaseLayout';

export function AgencyOnboardingPage() {
  return (
    <BaseLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Register Your Real Estate Agency
              </h1>
              <p className="text-xl text-gray-600">
                Join our platform and start managing properties with professional tools
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Agency Onboarding</h2>
              <p className="text-gray-600 mb-6">
                The agency onboarding wizard is currently being set up. Please check back soon!
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>Coming Soon:</strong> Complete agency registration wizard with:
                </p>
                <ul className="mt-2 text-blue-700 list-disc list-inside">
                  <li>Business information collection</li>
                  <li>Document upload and verification</li>
                  <li>Admin account setup</li>
                  <li>Terms and conditions acceptance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default AgencyOnboardingPage; 