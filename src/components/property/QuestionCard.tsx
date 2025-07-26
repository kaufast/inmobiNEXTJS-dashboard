import { ReactNode } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QuestionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function QuestionCard({ title, description, children, icon, className }: QuestionCardProps) {
  return (
    <div className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          {icon && icon}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </div>
  );
}