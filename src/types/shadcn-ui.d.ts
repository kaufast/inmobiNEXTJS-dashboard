/**
 * Type definitions for shadcn/ui components
 */

import { VariantProps } from 'class-variance-authority';

// Re-export BadgeProps with variant included
declare module '@/components/ui/badge' {
  import { badgeVariants } from '@/components/ui/badge';
  
  export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }
}

// Add PropertyCard types
declare module '@/components/property/PropertyCard' {
  import { Property } from '@shared/schema';
  
  export interface PropertyCardProps {
    property: Property;
    variant?: 'default' | 'minimal' | 'featured' | string;
    // key is a React internal prop and shouldn't be part of the component props interface
  }
} 