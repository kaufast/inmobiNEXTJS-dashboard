import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function PremiumRequiredPage() {
  const { t } = useTranslation('dashboard');
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <Crown className="h-8 w-8 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              {t('errors.premiumRequired.title')}
            </h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            {t('errors.premiumRequired.message')}
          </p>
          
          <p className="mt-2 text-sm text-gray-500">
            {t('errors.premiumRequired.hint')}
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="mt-4 bg-[#131313] hover:bg-white hover:text-[#131313] w-full">
            <Link href="/subscription">
              <Crown className="mr-2 h-4 w-4" />
              {t('errors.premiumRequired.buttonText')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}