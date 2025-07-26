import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Eye, EyeOff, Shield, Check, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AgencyStepAdminSetupProps {
  wizard: {
    data: any;
    updateData: (data: any) => void;
  };
}

export function AgencyStepAdminSetup({ wizard }: AgencyStepAdminSetupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    wizard.updateData({ [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Password validation rules
  const validatePassword = (password: string) => {
    const rules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    return rules;
  };

  const passwordRules = validatePassword(wizard.data.adminPassword || '');
  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!wizard.data.adminFirstName?.trim()) {
      newErrors.adminFirstName = 'First name is required';
    }
    
    if (!wizard.data.adminLastName?.trim()) {
      newErrors.adminLastName = 'Last name is required';
    }
    
    if (!wizard.data.adminEmail?.trim()) {
      newErrors.adminEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wizard.data.adminEmail)) {
      newErrors.adminEmail = 'Please enter a valid email address';
    }
    
    if (!wizard.data.adminPassword?.trim()) {
      newErrors.adminPassword = 'Password is required';
    } else if (!isPasswordValid) {
      newErrors.adminPassword = 'Password does not meet requirements';
    }
    
    if (!wizard.data.adminPasswordConfirm?.trim()) {
      newErrors.adminPasswordConfirm = 'Password confirmation is required';
    } else if (wizard.data.adminPassword !== wizard.data.adminPasswordConfirm) {
      newErrors.adminPasswordConfirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm ${met ? 'text-green-600' : 'text-red-500'}`}>
      {met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Admin Account Setup</span>
          </CardTitle>
          <CardDescription>
            Create the administrator account for your agency. This person will have full access to 
            manage your agency's profile, agents, and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Admin Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminFirstName" className="text-sm font-medium">
                First Name *
              </Label>
              <Input
                id="adminFirstName"
                placeholder="John"
                value={wizard.data.adminFirstName || ''}
                onChange={(e) => handleInputChange('adminFirstName', e.target.value)}
                className={errors.adminFirstName ? 'border-red-500' : ''}
              />
              {errors.adminFirstName && (
                <p className="text-sm text-red-600">{errors.adminFirstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminLastName" className="text-sm font-medium">
                Last Name *
              </Label>
              <Input
                id="adminLastName"
                placeholder="Smith"
                value={wizard.data.adminLastName || ''}
                onChange={(e) => handleInputChange('adminLastName', e.target.value)}
                className={errors.adminLastName ? 'border-red-500' : ''}
              />
              {errors.adminLastName && (
                <p className="text-sm text-red-600">{errors.adminLastName}</p>
              )}
            </div>
          </div>

          {/* Admin Email */}
          <div className="space-y-2">
            <Label htmlFor="adminEmail" className="text-sm font-medium">
              Admin Email *
            </Label>
            <Input
              id="adminEmail"
              type="email"
              placeholder="admin@youragency.com"
              value={wizard.data.adminEmail || ''}
              onChange={(e) => handleInputChange('adminEmail', e.target.value)}
              className={errors.adminEmail ? 'border-red-500' : ''}
            />
            {errors.adminEmail && (
              <p className="text-sm text-red-600">{errors.adminEmail}</p>
            )}
            <p className="text-sm text-gray-500">
              This will be the login email for the admin account
            </p>
          </div>

          {/* Password Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="text-sm font-medium">
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={wizard.data.adminPassword || ''}
                  onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                  className={errors.adminPassword ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.adminPassword && (
                <p className="text-sm text-red-600">{errors.adminPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPasswordConfirm" className="text-sm font-medium">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="adminPasswordConfirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={wizard.data.adminPasswordConfirm || ''}
                  onChange={(e) => handleInputChange('adminPasswordConfirm', e.target.value)}
                  className={errors.adminPasswordConfirm ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.adminPasswordConfirm && (
                <p className="text-sm text-red-600">{errors.adminPasswordConfirm}</p>
              )}
            </div>
          </div>

          {/* Password Requirements */}
          {wizard.data.adminPassword && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Password Requirements:</h4>
              <div className="space-y-2">
                <PasswordRequirement 
                  met={passwordRules.length} 
                  text="At least 8 characters long" 
                />
                <PasswordRequirement 
                  met={passwordRules.uppercase} 
                  text="Contains uppercase letter (A-Z)" 
                />
                <PasswordRequirement 
                  met={passwordRules.lowercase} 
                  text="Contains lowercase letter (a-z)" 
                />
                <PasswordRequirement 
                  met={passwordRules.number} 
                  text="Contains number (0-9)" 
                />
                <PasswordRequirement 
                  met={passwordRules.special} 
                  text="Contains special character (@$!%*?&)" 
                />
              </div>
            </div>
          )}

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> The admin account will have full access to your agency's 
              data and settings. Make sure to use a strong, unique password and keep the login credentials secure. 
              You can add additional admin users later from the dashboard.
            </AlertDescription>
          </Alert>

          {/* Role Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Admin Permissions Include:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Manage agency profile and settings</li>
              <li>• Add, remove, and manage agents</li>
              <li>• Access all property listings and transactions</li>
              <li>• View reports and analytics</li>
              <li>• Configure billing and subscription settings</li>
              <li>• Manage client communications</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 