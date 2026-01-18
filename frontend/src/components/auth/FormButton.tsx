'use client';

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
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 font-semibold shadow-lg ${className}`}
    >
      {children}
    </button>
  );
}