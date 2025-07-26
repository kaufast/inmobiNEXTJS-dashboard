import { useTranslation } from 'react-i18next';
import { PropertyMatchingChat } from '@/components/chat/PropertyMatchingChat';
import { PageHeader } from '@/components/ui/page-header';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export default function PropertyMatchingChatPage() {
  const { t } = useTranslation('common');
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    // Set page title
    document.title = t('propertyMatching.pageTitle');
  }, [t]);
  
  return (
    <Container className="py-8">
      <PageHeader
        title={t('propertyMatching.title')}
        description={t('propertyMatching.subtitle')}
      />
      
      <div className="mt-8 flex justify-center">
        <div className="w-full max-w-4xl">
          <PropertyMatchingChat />
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          {t('propertyMatching.disclaimer')}
        </p>
      </div>
    </Container>
  );
}