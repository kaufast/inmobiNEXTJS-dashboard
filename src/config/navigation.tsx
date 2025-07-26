import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Home as HomeIcon,
  Users,
  Heart,
  MessageSquare,
  Building,
  BarChart4,
  Settings,
  CheckCircle,
  Star,
  FileText,
  Shield,
  Calendar,

  Bot as BotIcon
} from "lucide-react";
import { FaUser } from "react-icons/fa";

interface NavItem {
  icon: ReactNode;
  label: string;
  href: string;
}

export const useUserNavItems = (): NavItem[] => {
  const { t } = useTranslation('dashboard');
  
  return [
    {
      icon: <LayoutDashboard size={20} />,
      label: t('navigation.dashboard'),
      href: "/dashboard",
    },
    {
      icon: <Heart size={20} />,
      label: t('navigation.favorites'),
      href: "/dashboard/favorites",
    },
    {
      icon: <MessageSquare size={20} />,
      label: t('navigation.messages'),
      href: "/dashboard/messages",
    },
    {
      icon: <Calendar size={20} />,
      label: t('navigation.tours'),
      href: "/dashboard/tours",
    },
    {
      icon: <FileText size={20} />,
      label: t('navigation.documents'),
      href: "/dashboard/documents",
    },
    {
      icon: <Shield size={20} />,
      label: t('navigation.verification'),
      href: "/dashboard/verification",
    },
    {
      icon: <FaUser size={20} />,
      label: t('navigation.profile'),
      href: "/dashboard/profile",
    },
    {
      icon: <BotIcon size={20} />,
      label: t('navigation.aiPropertyMatching'),
      href: "/property-matching-chat",
    },
  ];
};

export const useAgentNavItems = (): NavItem[] => {
  const { t } = useTranslation('dashboard');
  
  return [
    {
      icon: <LayoutDashboard size={20} />,
      label: t('navigation.dashboard'),
      href: "/dashboard",
    },
    {
      icon: <Building size={20} />,
      label: t('navigation.myProperties'),
      href: "/dashboard/properties",
    },
    {
      icon: <Calendar size={20} />,
      label: t('navigation.tours'),
      href: "/dashboard/tours",
    },
    {
      icon: <BarChart4 size={20} />,
      label: t('navigation.analytics'),
      href: "/dashboard/analytics",
    },
    {
      icon: <MessageSquare size={20} />,
      label: t('navigation.messages'),
      href: "/dashboard/messages",
    },
    {
      icon: <FileText size={20} />,
      label: t('navigation.documents'),
      href: "/dashboard/documents",
    },
    {
      icon: <Shield size={20} />,
      label: t('navigation.verification'),
      href: "/dashboard/verification",
    },
    {
      icon: <FaUser size={20} />,
      label: t('navigation.profile'),
      href: "/dashboard/profile",
    },
    {
      icon: <BotIcon size={20} />,
      label: t('navigation.aiPropertyMatching'),
      href: "/property-matching-chat",
    },
    {
      icon: <Star size={20} />,
      label: t('navigation.premiumFeatures'),
      href: "/agent/premium",
    },
    {
      icon: <Star size={20} />,
      label: t('navigation.subscription'),
      href: "/subscription",
    },
  ];
};

export const useAdminNavItems = (): NavItem[] => {
  const { t } = useTranslation('dashboard');
  
  return [
    {
      icon: <LayoutDashboard size={20} />,
      label: t('navigation.dashboard'),
      href: "/dashboard",
    },
    {
      icon: <Users size={20} />,
      label: t('navigation.users'),
      href: "/dashboard/users",
    },
    {
      icon: <Building size={20} />,
      label: t('navigation.properties'),
      href: "/dashboard/properties",
    },
    {
      icon: <MessageSquare size={20} />,
      label: t('navigation.messages'),
      href: "/dashboard/messages",
    },
    {
      icon: <Calendar size={20} />,
      label: t('navigation.tours'),
      href: "/dashboard/tours",
    },
    {
      icon: <CheckCircle size={20} />,
      label: t('navigation.approvals'),
      href: "/dashboard/approvals",
    },
    {
      icon: <Shield size={20} />,
      label: t('navigation.verification'),
      href: "/dashboard/verification",
    },
    {
      icon: <CheckCircle size={20} />,
      label: t('navigation.verificationManagement'),
      href: "/dashboard/verification-management",
    },
    {
      icon: <FileText size={20} />,
      label: t('navigation.documents'),
      href: "/dashboard/documents",
    },
    {
      icon: <BarChart4 size={20} />,
      label: t('navigation.analytics'),
      href: "/dashboard/analytics",
    },
    {
      icon: <Settings size={20} />,
      label: t('navigation.settings'),
      href: "/dashboard/settings",
    },
    {
      icon: <Star size={20} />,
      label: t('navigation.subscription'),
      href: "/subscription",
    },

  ];
};

// Legacy exports for backward compatibility
export const userNavItems: NavItem[] = [];
export const agentNavItems: NavItem[] = [];
export const adminNavItems: NavItem[] = []; 