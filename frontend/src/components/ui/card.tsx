// frontend/src/components/ui/card.tsx
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}
export function Card({ children, className = '' }: CardProps) {
  return <div className={`bg-white rounded-lg shadow p-4 ${className}`}>{children}</div>;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}
export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={`border-b pb-2 mb-4 ${className}`}>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}
export function CardTitle({ children, className = '' }: CardTitleProps) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}
export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>;
}
