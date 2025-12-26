import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <div className={`max-w-6xl mx-auto px-4 ${className}`}>
      {children}
    </div>
  );
}