import React from 'react';
import { cn } from '../../lib/utils';

interface LogoIconProps {
  className?: string;
  size?: number | string;
}

export function LogoIcon({ className, size = 32 }: LogoIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 256 256" 
      width={size} 
      height={size} 
      className={cn("text-red-500", className)}
    >
      <rect width="256" height="256" fill="none"/>
      
      {/* Background shape */}
      <rect x="40" y="32" width="176" height="192" rx="24" fill="currentColor"/>
      
      {/* Top folding element */}
      <path d="M160,32 L216,88 L160,88 Z" fill="#ffffff" opacity="0.3" />

      {/* PDF text lines or design */}
      <path d="M88,112h80M88,152h60" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="20"/>
      
      {/* Small accent box */}
      <rect x="88" y="64" width="48" height="20" rx="8" fill="#ffffff" />
    </svg>
  );
}
