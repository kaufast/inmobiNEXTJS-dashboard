import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUserNavItems, useAgentNavItems, useAdminNavItems } from '@/config/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { HomeIcon, Menu } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useTranslation } from 'react-i18next';

interface DashboardLayoutProps {
  children: React.ReactElement | React.ReactElement[];
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, href, isActive, onClick }: NavItemProps) {
  const { currentLanguage: locale } = useLanguage();
  const route = (path: string) => `/${locale}${path.startsWith('/') ? path : '/' + path}`;

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2",
        isActive && "bg-neutral-100"
      )}
      asChild
    >
      <Link href={route(href)} onClick={onClick}>
        {icon}
        {label}
      </Link>
    </Button>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation, isLoading: isAuthLoading } = useAuth();
  const { currentLanguage: locale } = useLanguage();
  const { t } = useTranslation('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Get navigation items based on user role
  const userNavItems = useUserNavItems();
  const agentNavItems = useAgentNavItems();
  const adminNavItems = useAdminNavItems();

  const isActive = (path: string) => location === path;
  const closeMobileNav = () => setIsMobileNavOpen(false);
  const route = (path: string) => `/${locale}${path.startsWith('/') ? path : '/' + path}`;

  // Memoize the nav items to prevent recalculation on every render
  const navItems = useMemo(() => {
    if (user?.role === "admin") {
      return adminNavItems;
    }
    if (user?.role === "agent") {
      return agentNavItems;
    }
    return userNavItems;
  }, [user?.role, adminNavItems, agentNavItems, userNavItems]); // Updated dependencies

  const renderNavItems = (onClick?: () => void) => (
    <>
      {isAuthLoading ? (
        <div className="p-4 text-center text-neutral-500">{t('navigation.loadingNavigation', 'Loading navigation...')}</div>
      ) : (
        navItems.map((item: { icon: React.ReactNode; label: string; href: string }) => (
          <div key={item.href}>
            <NavItem {...item} isActive={isActive(item.href)} onClick={onClick} />
          </div>
        ))
      )}
      <NavItem
        icon={<HomeIcon size={20} />}
        label={t('navigation.backToHome', 'Back to Home')}
        href="/"
        isActive={false}
        onClick={onClick}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-white lg:block">
        <div className="flex h-16 items-center border-b px-6">
          <Link href={route('/dashboard')} className="flex items-center gap-2 font-semibold text-xl">
            [ inmobi ]
          </Link>
        </div>
        <nav className="grid gap-1 p-4">
          {renderNavItems()}
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b bg-white lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center border-b px-6">
                <Link href={route('/dashboard')} className="flex items-center gap-2 font-semibold text-xl">
                  [ inmobi ]
                </Link>
              </div>
              <nav className="grid gap-1 p-4">
                {renderNavItems(closeMobileNav)}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href={route('/dashboard')} className="flex items-center gap-2 font-semibold text-xl">
            [ inmobi ]
          </Link>
          <div className="w-10" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  );
}