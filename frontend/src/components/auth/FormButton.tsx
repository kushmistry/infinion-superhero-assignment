'use client';

import { PrimaryButton } from '@/components/common/PrimaryButton';
import { cn } from '@/lib/utils';

interface FormButtonProps {
  type?: 'submit' | 'button';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function FormButton({
  type = 'submit',
  disabled = false,
  children,
  onClick,
  className = ""
}: FormButtonProps) {
  return (
    <PrimaryButton
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn("w-full", className)}
    >
      {children}
    </PrimaryButton>
  );
}