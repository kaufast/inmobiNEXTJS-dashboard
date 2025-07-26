import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Mic, Bath, User } from "lucide-react";

const reportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  email: z.string().email("Please enter a valid email").optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportIssueButtonProps {
  context?: string;
  className?: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
}

export function ReportIssueButton({ 
  context = "general", 
  className = "",
  variant = "outline"
}: ReportIssueButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation('common');
  
  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      description: "",
      email: "",
    }
  });
  
  const handleSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would send the report to a backend endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: t('report.submitSuccess'),
        description: t('report.submitSuccessDescription'),
      });
      
      form.reset();
      setIsOpen(false);
    } catch (error) {
      toast({
        title: t('report.submitError'),
        description: t('report.submitErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          className={className}
          size="sm"
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          {t('report.buttonText')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('report.title')}</DialogTitle>
          <DialogDescription>
            {t('report.description', { context })}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('report.issueTitleLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('report.issueTitlePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('report.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('report.descriptionPlaceholder')} 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {t('report.descriptionHelp')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('report.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder={t('report.emailPlaceholder')} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {t('report.emailHelp')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                {t('general.actions.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#131313] text-white hover:bg-white hover:text-[#131313]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('report.submitting')}
                  </>
                ) : (
                  t('report.submit')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}