import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { MessageSquare, HelpCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ContactButton({ 
  variant = 'fixed', 
  label = '',
  reportType = 'feedback'
}: { 
  variant?: 'fixed' | 'inline';
  label?: string;
  reportType?: 'feedback' | 'error' | 'any'; 
}) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [messageType, setMessageType] = useState<string>(reportType === 'any' ? 'feedback' : reportType);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real app, this would send the message to the server
    // Simulate API call with setTimeout
    setTimeout(() => {
      toast({
        title: t('contact.messageSent'),
        description: t('contact.thankYouFeedback'),
      });
      setOpen(false);
      setSubject('');
      setMessage('');
      setIsSubmitting(false);
    }, 1000);
  };

  const getIcon = () => {
    switch (messageType) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 mr-2" />;
      case 'feedback':
        return <MessageSquare className="h-4 w-4 mr-2" />;
      case 'help':
        return <HelpCircle className="h-4 w-4 mr-2" />;
      default:
        return <MessageSquare className="h-4 w-4 mr-2" />;
    }
  };

  const getMessage = () => {
    switch (messageType) {
      case 'error':
        return t('contact.reportProblemPlaceholder');
      case 'feedback':
        return t('contact.shareFeedbackPlaceholder');
      case 'help':
        return t('contact.askQuestionPlaceholder');
      default:
        return t('contact.defaultMessagePlaceholder');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'fixed' ? (
          <Button 
            className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 shadow-lg bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
            size="icon"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        ) : (
          <Button 
            className="bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
            size={label ? 'default' : 'icon'}
          >
            {label ? (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                {label}
              </>
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('contact.contactUs')}</DialogTitle>
            <DialogDescription>
              {t('contact.sendMessageDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {reportType === 'any' && (
              <div className="space-y-2">
                <Label htmlFor="messageType">{t('contact.messageType')}</Label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger>
                    <SelectValue>{t('contact.selectMessageType')}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feedback">{t('contact.feedback')}</SelectItem>
                    <SelectItem value="error">{t('contact.reportError')}</SelectItem>
                    <SelectItem value="help">{t('contact.getHelp')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {getIcon()}
                <Label htmlFor="subject">{messageType === 'error' ? t('contact.errorDescription') : t('contact.subject')}</Label>
              </div>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={messageType === 'error' ? t('contact.brieflyDescribeError') : t('contact.whatIsMessageAbout')}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">{t('contact.message')}</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={getMessage()}
                className="h-32"
                required
              />
            </div>
            
            {user ? (
              <p className="text-sm text-muted-foreground">
                {t('contact.willBeContactedAt')}: {user.email}
              </p>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="email">{t('contact.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('contact.enterEmailAddress')}
                  required
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('general.cancel', { ns: 'actions' })}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
            >
              {isSubmitting ? t('contact.sending') : t('contact.sendMessage')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}