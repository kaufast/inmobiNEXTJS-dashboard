import React from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface TourProps {
  steps: Step[];
  run: boolean;
  onComplete?: (data: CallBackProps) => void;
  onSkip?: (data: CallBackProps) => void;
  onStart?: (data: CallBackProps) => void;
  className?: string;
}

export function Tour({ 
  steps, 
  run, 
  onComplete, 
  onSkip, 
  onStart,
  className 
}: TourProps) {
  const { t } = useTranslation('tour');
  
  const tourStyles = {
    options: {
      primaryColor: 'hsl(var(--primary))',
      backgroundColor: 'hsl(var(--background))',
      textColor: 'hsl(var(--foreground))',
      arrowColor: 'hsl(var(--card))',
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 1000,
    },
    tooltip: {
      backgroundColor: 'hsl(var(--card))',
      borderRadius: 'var(--radius)',
      fontSize: '14px',
      fontFamily: 'var(--font-sans)',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid hsl(var(--border))',
      color: 'hsl(var(--card-foreground))',
      padding: '16px',
      maxWidth: '320px',
    },
    tooltipTitle: {
      color: 'hsl(var(--card-foreground))',
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px',
    },
    tooltipContent: {
      color: 'hsl(var(--muted-foreground))',
      fontSize: '14px',
      lineHeight: '1.5',
    },
    buttonNext: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      borderRadius: 'var(--radius)',
      fontSize: '14px',
      fontWeight: '500',
      padding: '8px 16px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    buttonBack: {
      backgroundColor: 'transparent',
      color: 'hsl(var(--muted-foreground))',
      fontSize: '14px',
      fontWeight: '500',
      padding: '8px 16px',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'var(--radius)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    buttonSkip: {
      backgroundColor: 'transparent',
      color: 'hsl(var(--muted-foreground))',
      fontSize: '14px',
      fontWeight: '500',
      padding: '8px 16px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    buttonClose: {
      backgroundColor: 'transparent',
      color: 'hsl(var(--muted-foreground))',
      fontSize: '14px',
      fontWeight: '500',
      padding: '8px 16px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    spotlight: {
      backgroundColor: 'transparent',
      borderRadius: 'var(--radius)',
    },
    floater: {
      filter: 'drop-shadow(0 4px 6px -1px rgb(0 0 0 / 0.1))',
    },
  };

  const handleCallback = (data: CallBackProps) => {
    const { status, type } = data;

    if (status === STATUS.FINISHED && onComplete) {
      onComplete(data);
    }

    if (status === STATUS.SKIPPED && onSkip) {
      onSkip(data);
    }

    if (type === 'step:after' && onStart) {
      onStart(data);
    }
  };

  return (
    <div className={cn('tour-container', className)}>
      <Joyride
        steps={steps}
        run={run}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        showCloseButton={true}
        scrollToFirstStep={true}
        spotlightClicks={false}
        disableOverlayClose={true}
        styles={tourStyles}
        callback={handleCallback}
        locale={{
          back: t('buttons.previous'),
          close: t('buttons.close'),
          last: t('buttons.finish'),
          next: t('buttons.next'),
          skip: t('buttons.skip'),
          step: t('buttons.step'),
          of: t('buttons.of'),
        }}
      />
    </div>
  );
}

export default Tour; 