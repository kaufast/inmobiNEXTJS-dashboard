import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";

interface LocaleLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function LocaleLink({ href, children, className }: LocaleLinkProps) {
  const { currentLanguage } = useLanguage();
  const localizedHref = `/${currentLanguage}${href.startsWith('/') ? href : `/${href}`}`;
  
  return (
    <Link href={localizedHref} className={className}>
      {children}
    </Link>
  );
} 