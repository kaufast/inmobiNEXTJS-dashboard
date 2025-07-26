import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  paddingX?: "none" | "sm" | "md" | "lg";
  center?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const maxWidthMap = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  "2xl": "max-w-[1400px]",
  full: "max-w-full",
};

const paddingXMap = {
  none: "px-0",
  sm: "px-4",
  md: "px-6",
  lg: "px-8",
};

export function Container({
  maxWidth = "lg",
  paddingX = "md",
  center = true,
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        maxWidthMap[maxWidth],
        paddingXMap[paddingX],
        center && "mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}