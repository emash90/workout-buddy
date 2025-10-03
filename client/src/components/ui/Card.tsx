import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  gradient?: string;
}

export const Card = ({ children, className = '', onClick, gradient }: CardProps) => {
  const baseClasses = gradient
    ? `${gradient} rounded-2xl p-6 shadow-sm text-white`
    : 'bg-white rounded-2xl p-6 shadow-sm border border-gray-100';

  return (
    <div
      className={`${baseClasses} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent = ({ children, className = '' }: CardContentProps) => {
  return <div className={className}>{children}</div>;
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter = ({ children, className = '' }: CardFooterProps) => {
  return <div className={`mt-6 pt-6 border-t border-gray-100 ${className}`}>{children}</div>;
};
