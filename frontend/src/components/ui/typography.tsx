import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

// Heading Components
export function H1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn(
      "text-4xl font-bold tracking-tight text-near-white lg:text-5xl",
      className
    )}>
      {children}
    </h1>
  );
}

export function H2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn(
      "text-3xl font-semibold tracking-tight text-near-white",
      className
    )}>
      {children}
    </h2>
  );
}

export function H3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn(
      "text-2xl font-semibold tracking-tight text-near-white",
      className
    )}>
      {children}
    </h3>
  );
}

export function H4({ children, className }: TypographyProps) {
  return (
    <h4 className={cn(
      "text-xl font-semibold tracking-tight text-near-white",
      className
    )}>
      {children}
    </h4>
  );
}

// Body Text Components
export function BodyLarge({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-lg text-cool-grey leading-7",
      className
    )}>
      {children}
    </p>
  );
}

export function Body({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-base text-cool-grey leading-6",
      className
    )}>
      {children}
    </p>
  );
}

export function BodySmall({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-sm text-cool-grey leading-5",
      className
    )}>
      {children}
    </p>
  );
}

// Label and Caption Components
export function LabelLarge({ children, className }: TypographyProps) {
  return (
    <label className={cn(
      "text-sm font-medium text-near-white",
      className
    )}>
      {children}
    </label>
  );
}

export function LabelMedium({ children, className }: TypographyProps) {
  return (
    <label className={cn(
      "text-sm font-medium text-cool-grey",
      className
    )}>
      {children}
    </label>
  );
}

export function Caption({ children, className }: TypographyProps) {
  return (
    <span className={cn(
      "text-xs text-cool-grey",
      className
    )}>
      {children}
    </span>
  );
}

// Specialized Text Components
export function Muted({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-sm text-cool-grey opacity-70",
      className
    )}>
      {children}
    </p>
  );
}

export function Lead({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-xl text-cool-grey leading-7",
      className
    )}>
      {children}
    </p>
  );
}

export function Code({ children, className }: TypographyProps) {
  return (
    <code className={cn(
      "relative rounded bg-charcoal-glass px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-ice-blue",
      className
    )}>
      {children}
    </code>
  );
}

// Link Component
interface LinkProps extends TypographyProps {
  href?: string;
  onClick?: () => void;
}

export function Link({ children, className, href, onClick }: LinkProps) {
  const Component = href ? 'a' : 'button';
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        "text-ice-blue underline-offset-4 hover:underline transition-colors",
        className
      )}
    >
      {children}
    </Component>
  );
} 