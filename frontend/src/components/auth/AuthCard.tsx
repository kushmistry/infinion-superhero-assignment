'use client';

import { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode | ((submitForm: () => void) => ReactNode);
  submitForm?: () => void;
  className?: string;
}

export default function AuthCard({ title, subtitle, children, footer, submitForm, className = "" }: AuthCardProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* SuperHero Hub Title */}
      <div className="text-center mb-8 flex-shrink-0">
        <h1 className="text-4xl font-bold text-white mb-2">SuperHero Hub</h1>
        <p className="text-purple-200 text-sm">Your ultimate superhero companion</p>
      </div>

      {/* Auth Card */}
      <div className={`bg-gray-900 border border-purple-500/30 rounded-xl shadow-2xl w-full max-w-md backdrop-blur-sm max-h-[calc(100vh-200px)] flex flex-col ${className}`}>
        {/* Fixed Header */}
        <div className="p-8 pb-4 flex-shrink-0">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            {subtitle && <p className="text-purple-300 text-sm">{subtitle}</p>}
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="px-8 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-800 scrollbar-thumb-rounded">
          <div className="pb-4">
            {children}
          </div>
        </div>

        {/* Fixed Footer Area */}
        {footer && (
          <div className="px-8 py-6 border-t border-purple-500/20">
            {typeof footer === 'function' ? footer(submitForm!) : footer}
          </div>
        )}
      </div>
    </div>
  );
}