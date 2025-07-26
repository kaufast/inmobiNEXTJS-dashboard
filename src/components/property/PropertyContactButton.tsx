import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { NewMessageDialog } from '@/components/messaging/NewMessageDialog';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface PropertyContactButtonProps {
  property: any;
  agent?: any;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showPhone?: boolean;
  fullWidth?: boolean;
}

export function PropertyContactButton({
  property,
  agent,
  variant = 'default',
  size = 'default',
  className,
  showPhone = false,
  fullWidth = false,
}: PropertyContactButtonProps) {
  const { t } = useTranslation(['properties', 'common']);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  const handleContactAgent = () => {
    if (!user) {
      toast({
        title: t('common:auth.loginRequired') || 'Login Required',
        description: t('common:auth.loginToContact') || 'Please log in to contact the agent',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    // Open messaging dialog with property context
    setIsMessageDialogOpen(true);
  };

  const handlePhoneCall = () => {
    if (property.phoneNumber && property.phoneCountryCode) {
      const phoneNumber = `${property.phoneCountryCode}${property.phoneNumber}`;
      window.open(`tel:${phoneNumber}`, '_self');
    } else {
      toast({
        title: t('properties:contact.phoneNotAvailable') || 'Phone not available',
        description: t('properties:contact.useMessageInstead') || 'Please use the message option instead',
        variant: 'default',
      });
    }
  };

  const getAgentName = () => {
    if (agent) {
      return agent.fullName || agent.username;
    }
    return property.ownerName || t('properties:contact.propertyOwner') || 'Property Owner';
  };

  return (
    <>
      <div className={cn('flex gap-2', fullWidth && 'w-full', className)}>
        <Button
          onClick={handleContactAgent}
          variant={variant}
          size={size}
          className={cn(
            'flex items-center gap-2',
            fullWidth && 'flex-1',
            'bg-black text-white hover:bg-gray-800 border-black !important'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Send Message
        </Button>

        {showPhone && property.isPhoneNumberPublic && property.phoneNumber && (
          <Button
            onClick={handlePhoneCall}
            variant="outline"
            size={size}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Phone className="h-4 w-4" />
            {size === 'sm' ? '' : 'Call'}
          </Button>
        )}
      </div>

      <NewMessageDialog
        open={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        onSuccess={() => {
          setIsMessageDialogOpen(false);
          toast({
            title: t('common:dashboard.messages.sendSuccess', 'Message sent successfully'),
            description: t('common:dashboard.messages.messageHasBeenSent', 'Your message has been sent'),
          });
          navigate('/dashboard/messages');
        }}
        initialRecipient={agent}
        initialSubject={`${t('properties:contact.inquiryAbout', 'Inquiry about')} ${property.title}`}
        initialContent={`${t('properties:contact.defaultInquiry', 'Hi, I am interested in your property "{{propertyTitle}}" and would like to know more details. Please contact me at your earliest convenience.', {
          propertyTitle: property.title,
          agentName: getAgentName(),
        })}`}
        propertyId={property.id}
      />
    </>
  );
}

// Agent contact card component for property details
interface AgentContactCardProps {
  property: any;
  agent?: any;
  className?: string;
}

export function AgentContactCard({ property, agent, className }: AgentContactCardProps) {
  const { t } = useTranslation(['properties', 'common']);

  const getAgentInitials = () => {
    if (agent?.fullName) {
      return agent.fullName
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'AG';
  };

  const getAgentName = () => {
    if (agent) {
      return agent.fullName || agent.username;
    }
    return property.ownerName || t('properties:contact.propertyOwner', 'Property Owner');
  };

  const getAgentRole = () => {
    if (agent?.role === 'agent' || agent?.role === 'agency_agent') {
      return t('properties:contact.propertyAgent', 'Property Agent');
    }
    return t('properties:contact.propertyOwner', 'Property Owner');
  };

  return (
    <div className={cn('bg-white rounded-xl shadow-md p-6', className)}>
      <h3 className="font-heading text-xl font-bold mb-4">
        {t('properties:contact.contactAgent', 'Contact Agent')}
      </h3>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-500 text-xl font-semibold">
            {agent?.avatar ? (
              <img 
                src={agent.avatar} 
                alt={getAgentName()} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getAgentInitials()
            )}
          </div>
        </div>
        
        <div className="flex-grow">
          <h4 className="font-heading text-lg font-bold">{getAgentName()}</h4>
          <p className="text-neutral-600 mb-3">{getAgentRole()}</p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            {property.isPhoneNumberPublic && property.phoneNumber && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-primary mr-2" />
                <span>{property.phoneCountryCode}{property.phoneNumber}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <User className="h-4 w-4 text-primary mr-2" />
              <span>{t('properties:contact.verifiedAgent', 'Verified Agent')}</span>
            </div>
          </div>
          
          <PropertyContactButton
            property={property}
            agent={agent}
            showPhone={true}
            fullWidth={false}
            className="mt-4"
          />
        </div>
      </div>
    </div>
  );
} 