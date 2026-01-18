'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function BackButton({ href, label, className }: BackButtonProps) {
  return (
    <div className={cn("flex items-center gap-3 mb-6", className)}>
      <Button
        variant="ghost"
        size="icon"
        asChild
        className="rounded-full bg-gray-800 border border-purple-500/30 text-purple-400 hover:text-purple-300 hover:bg-gray-700"
      >
        <Link href={href} title={label || "Back"}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </Button>
      {label && (
        <Link
          href={href}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          {label}
        </Link>
      )}
    </div>
  );
}
