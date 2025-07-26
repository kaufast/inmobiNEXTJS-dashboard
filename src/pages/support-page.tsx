import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, MessageSquare, Mail, Clock } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

export default function SupportPage() {
  const { t } = useTranslation("common");

  const supportOptions = [
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Chat Support",
      description: "Get immediate help with your questions",
      action: "Start Chat",
      path: "/chat-support",
      availability: "24/7"
    },
    {
      icon: <Mail className="h-8 w-8 text-primary" />,
      title: "Email Support",
      description: "Send us a detailed message about your issue",
      action: "Send Email",
      path: "mailto:support@inmobi.mobi",
      availability: "Response within 24 hours"
    },
    {
      icon: <PhoneCall className="h-8 w-8 text-primary" />,
      title: "Phone Support",
      description: "Speak directly with our support team",
      action: "Call Support",
      path: "tel:+1234567890",
      availability: "Mon-Fri, 9AM-5PM"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("footer.contactUs")}</h2>
          <p className="text-muted-foreground">
            Contact our support team for help with any issues
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {supportOptions.map((option, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="bg-neutral-100 p-3 rounded-md">
                    {option.icon}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{option.availability}</span>
                  </div>
                </div>
                <CardTitle className="mt-2">{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
                  asChild
                >
                  <Link href={option.path}>{option.action}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">How do I upgrade my subscription?</h3>
              <p className="text-sm text-muted-foreground">
                Go to the Subscription page in your dashboard and select the plan that best fits your needs.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">How can I list multiple properties at once?</h3>
              <p className="text-sm text-muted-foreground">
                Premium users can use our Bulk Upload feature available on the Agent Properties page.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">How do I schedule property tours?</h3>
              <p className="text-sm text-muted-foreground">
                Navigate to the Tours page in your dashboard to schedule and manage property viewings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}