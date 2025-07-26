import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation('common');
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              {t('errors.notFound.title')}
            </h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            {t('errors.notFound.message')}
          </p>
          
          <p className="mt-2 text-sm text-gray-500">
            {t('errors.notFound.hint')}
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="mt-4">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              {t('errors.notFound.buttonText')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
