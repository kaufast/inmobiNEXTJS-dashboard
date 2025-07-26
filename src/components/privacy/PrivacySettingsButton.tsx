import React from 'react';
import { Button } from '@/components/ui/button';
import { useUsercentrics } from '@/hooks/use-usercentrics';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';

interface PrivacySettingsButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function PrivacySettingsButton({ 
  variant = 'ghost', 
  size = 'sm',
  className = ''
}: PrivacySettingsButtonProps) {
  const { t } = useTranslation('common');
  const { showPrivacySettings, isInitialized } = useUsercentrics();

  const handleShowSettings = async () => {
    if (!isInitialized) return;
    await showPrivacySettings();
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShowSettings}
      className={className}
    >
      <Settings className="h-4 w-4 mr-2" />
      {t('privacy.settings.title')}
    </Button>
  );
}