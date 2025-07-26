import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import { useMediaQuery } from '@/hooks/use-mobile';
import {
    Building,
    ChevronDown,
    Crown,
    Heart,
    Home,
    LayoutDashboard,
    LogOut,
    Map,
    Menu,
    MessageSquare,
    Mic,
    Search,
    Settings,
    Sparkles,
    TrendingUp,
    User,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import LanguageSelector from '../ui/language-selector';

export default function Navbar() {
  const [, navigate] = useLocation();
  const { user, logoutMutation, refetchUser } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { t, i18n } = useTranslation(['common']);

  const locale = i18n.language || 'en-GB';

  // Prefixes path with locale (e.g., "/en-GB/dashboard")
  const route = (path: string) => `/${locale}${path.startsWith('/') ? path : `/${path}`}`;

  React.useEffect(() => {
    refetchUser();
  }, [refetchUser]);
  
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate(route('/auth'));
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const avatarFallback = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : 'IM';

  const toggleNav = () => setNavOpen(!navOpen);
  const closeNav = () => setNavOpen(false);

  return (
    <TooltipProvider>
      <header className="border-b sticky top-0 z-50 bg-black text-white">
        <div className="container mx-auto flex justify-between items-center h-16 px-4">
        {/* Left section - navigation */}
        <nav className={`hidden md:flex items-center space-x-1`}>
          <Button variant="ghost" asChild className="text-white hover:text-black hover:bg-white">
            <Link href={route("/")}>
              <Home className="w-4 h-4 mr-2" />
              {t('general.home')}
            </Link>
          </Button>

          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 text-white hover:text-black hover:bg-white">
                <Search className="w-4 h-4 mr-1" />
                {t('navbar.search')}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href={route("/search")} className="cursor-pointer" onClick={closeNav}>
                  <Search className="w-4 h-4 mr-2" />
                  {t('navbar.searchSection.title')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={route("/spatial-search")} className="cursor-pointer" onClick={closeNav}>
                  <Map className="w-4 h-4 mr-2" />
                  {t('navbar.searchSection.advancedSearch')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={route("/voice-search")} className="cursor-pointer" onClick={closeNav}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Mic className="w-4 h-4 mr-2" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Search properties using voice commands</p>
                    </TooltipContent>
                  </Tooltip>
                  {t('navbar.searchSection.voiceSearch')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={route("/property-matching")} className="cursor-pointer" onClick={closeNav}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('navbar.searchSection.propertyMatching')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button className="bg-black text-white hover:bg-white hover:text-black border border-white" asChild>
            <Link href={route("/search-wizard")}>
              <Sparkles className="w-4 h-4 mr-2" />
              {t('navbar.aiPropertyWizard')}
            </Link>
          </Button>
        </nav>

        {/* Center - Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="flex items-center gap-2 font-semibold text-xl text-white">
            [ inmobi ]
          </Link>
        </div>

        {/* Right section - auth and buttons */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {/* Premium button */}
              {user.subscriptionTier !== 'premium' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" asChild className="text-white bg-black hover:text-black hover:bg-white border border-white">
                      <Link href={route("/subscription")}>
                        <Crown className="w-4 h-4 mr-2" />
                        {t('navbar.subscription')}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upgrade to premium for exclusive features</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <Button className="bg-white text-black hover:bg-neutral-200 hover:text-black transition-all" asChild>
                <Link href={route("/add-property-wizard")}>
                  <Building className="w-4 h-4 mr-2" />
                  {t('navbar.addProperty')}
                </Link>
              </Button>

              <Button className="bg-black text-white hover:bg-white hover:text-black border border-white" asChild>
                 <Link href={route("/dashboard")}>

                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {t('navbar.dashboard')}
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0 text-white hover:bg-white hover:text-black">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar as string || ''} alt={user.username || 'User'} />
                      <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                    {user.subscriptionTier === 'premium' && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-amber-400 text-white">
                        <Crown className="h-3 w-3" />
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.username}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'agent' && (
                    <DropdownMenuItem asChild>
                      <Link href={route("/dashboard/properties")} className="cursor-pointer">
                        <Building className="w-4 h-4 mr-2" />
                        {t('navbar.properties')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href={route("/dashboard/messages")} className="cursor-pointer">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <MessageSquare className="w-4 h-4 mr-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View and manage your messages</p>
                        </TooltipContent>
                      </Tooltip>
                      {t('navbar.messages')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={route("/dashboard/favorites")} className="cursor-pointer">
                      <Heart className="w-4 h-4 mr-2" />
                      {t('navbar.favorites')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={route("/search-wizard")} className="cursor-pointer">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t('navbar.aiPropertyWizard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={route("/dashboard/profile")} className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      {t('navbar.settings')}
                    </Link>
                  </DropdownMenuItem>
                  {user.subscriptionTier !== 'premium' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={route("/subscription")} className="cursor-pointer">
                          <Crown className="w-4 h-4 mr-2" />
                          {t('navbar.subscription')}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('navbar.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <LanguageSelector />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-white bg-black hover:text-black hover:bg-white border border-white">
                <Link href={route("/subscription")}>
                  <Crown className="w-4 h-4 mr-2" />
                  {t('navbar.premium')}
                </Link>
              </Button>
              
              <Button className="bg-white text-black hover:bg-neutral-200 hover:text-black transition-all" asChild>
                <Link href={route("/add-property-wizard")}>
                  <Building className="w-4 h-4 mr-2" />
                  {t('navbar.addProperty')}
                </Link>
              </Button>
              
              <Button variant="ghost" asChild className="text-white hover:text-black hover:bg-white">
                <Link href={route("/auth")}>
                  <User className="w-4 h-4 mr-2" />
                  {t('navbar.login')}
                </Link>
              </Button>
              
              <LanguageSelector />
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleNav}
        >
          {navOpen ? <X /> : <Menu />}
        </Button>

        {/* Mobile navigation menu */}
        {isMobile && navOpen && (
          <div className="fixed inset-0 top-16 bg-black text-white z-40 p-4">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                className="text-white hover:text-black hover:bg-white flex items-center gap-2"
                onClick={closeNav}
              >
                <X className="h-5 w-5" />
                Back
              </Button>
              <div className="flex items-center gap-4">
                <LanguageSelector />
              </div>
            </div>
            
            <nav className="flex flex-col space-y-4 items-center">
              <Button variant="ghost" asChild onClick={closeNav} className="text-white hover:text-black hover:bg-white justify-center">
                <Link href={route("/")} className="justify-center">
                  <Home className="w-5 h-5 mr-2" />
                  {t('general.home')}
                </Link>
              </Button>

              <Button variant="ghost" asChild onClick={closeNav} className="text-white hover:text-black hover:bg-white justify-center">
                <Link href={route("/search")} className="justify-center">
                  <Search className="w-5 h-5 mr-2" />
                  {t('navbar.searchSection.title')}
                </Link>
              </Button>
              
              <Button variant="ghost" asChild onClick={closeNav} className="text-white hover:text-black hover:bg-white justify-center">
                <Link href={route("/spatial-search")} className="justify-center">
                  <Map className="w-5 h-5 mr-2" />
                  {t('navbar.searchSection.advancedSearch')}
                </Link>
              </Button>
              
              <Button variant="ghost" asChild onClick={closeNav} className="text-white hover:text-black hover:bg-white justify-center">
                <Link href={route("/voice-search")} className="justify-center">
                  <Mic className="w-5 h-5 mr-2" />
                  {t('navbar.searchSection.voiceSearch')}
                </Link>
              </Button>
              
              <Button variant="ghost" asChild onClick={closeNav} className="text-white hover:text-black hover:bg-white justify-center">
                <Link href={route("/property-matching")} className="justify-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t('navbar.searchSection.propertyMatching')}
                </Link>
              </Button>
              
              <Button variant="ghost" asChild onClick={closeNav} className="text-white hover:text-black hover:bg-white justify-center">
                <Link href={route("/subscription")} className="justify-center">
                  <Crown className="w-5 h-5 mr-2" />
                  {t('navbar.subscription')}
                </Link>
              </Button>
              
              {user ? (
                <>
                  <div className="border-t border-gray-700 pt-4 mt-2">
                    <div className="flex flex-col items-center mb-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="h-12 w-12 mb-3 cursor-help">
                            <AvatarImage src={user.avatar as string || ''} alt={user.username || 'User'} />
                            <AvatarFallback>{avatarFallback}</AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('navbar.userProfile') || 'User Profile'}</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="text-center">
                        <div className="font-medium text-white">{user.username}</div>
                        <div className="text-sm text-gray-300 truncate">{user.email}</div>
                      </div>
                    </div>
                    
                    <Button variant="ghost" asChild onClick={closeNav} className="w-full justify-center text-white hover:text-black hover:bg-white h-auto py-2">
                      <Link href={route("/add-property-wizard")} className="justify-center">
                        <Building className="w-4 h-4 mr-2" />
                        {t('navbar.addProperty')}
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" asChild onClick={closeNav} className="w-full justify-center text-white hover:text-black hover:bg-white h-auto py-2">
                      <Link href={route("/dashboard")} className="justify-center"> 
                        <LayoutDashboard className="w-5 h-5 mr-2" />
                        {t('navbar.dashboard')}
                      </Link>
                    </Button>
                    
                    {user.role === 'agent' && (
                      <Button variant="ghost" asChild onClick={closeNav} className="w-full justify-center text-white hover:text-black hover:bg-white h-auto py-2">
                        <Link href={route("/dashboard/properties")} className="justify-center">
                          <Building className="w-5 h-5 mr-2" />
                          {t('navbar.properties')}
                        </Link>
                      </Button>
                    )}
                    
                    <Button variant="ghost" asChild onClick={closeNav} className="w-full justify-center text-white hover:text-black hover:bg-white h-auto py-2">
                      <Link href={route("/dashboard/messages")} className="justify-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        {t('navbar.messages')}
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" asChild onClick={closeNav} className="w-full justify-center text-white hover:text-black hover:bg-white h-auto py-2">
                      <Link href={route("/dashboard/favorites")} className="justify-center">
                        <Heart className="w-5 h-5 mr-2" />
                        {t('navbar.favorites')}
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" asChild onClick={closeNav} className="w-full justify-center text-white hover:text-black hover:bg-white h-auto py-2">
                      <Link href={route("/search-wizard")} className="justify-center">
                        <Sparkles className="w-5 h-5 mr-2" />
                        {t('navbar.aiPropertyWizard')}
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" asChild onClick={closeNav} className="w-full justify-center text-white hover:text-black hover:bg-white h-auto py-2">
                      <Link href={route("/dashboard/profile")} className="justify-center">
                        <Settings className="w-5 h-5 mr-2" />
                        {t('navbar.settings')}
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" onClick={handleLogout} className="w-full justify-center text-red-300 hover:text-red-500 hover:bg-red-900 h-auto py-2">
                      <LogOut className="w-5 h-5 mr-2" />
                      {t('navbar.logout')}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-700 pt-4 flex flex-col gap-4 items-center">
                  <Button variant="ghost" asChild onClick={closeNav} className="w-full justify-center text-white hover:text-black hover:bg-white h-auto py-2">
                    <Link href={route("/add-property-wizard")} className="justify-center">
                      <Building className="w-4 h-4 mr-2" />
                      {t('navbar.addProperty')}
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black bg-transparent !text-white hover:!text-black justify-center" asChild onClick={closeNav}>
                    <Link href={route("/auth")} className="justify-center">
                      <User className="w-4 h-4 mr-2" />
                      {t('navbar.login')}
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
        </div>
      </header>
    </TooltipProvider>
  );
}