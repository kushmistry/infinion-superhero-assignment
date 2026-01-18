'use client';

import { Field, ErrorMessage, useField } from 'formik';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  id: string;
  name: string;
  label?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export default function FormSelect({ 
  id, 
  name, 
  label, 
  required = false, 
  options, 
  placeholder,
  className = ""
}: FormSelectProps) {
  const [field, meta, helpers] = useField(name);

  return (
    <div>
      {label && (
        <Label htmlFor={id} className="mb-2">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select
        value={field.value?.toString() || ''}
        onValueChange={(value) => helpers.setValue(value)}
        name={name}
      >
        <SelectTrigger id={id} className={cn("w-full", className)}>
          <SelectValue placeholder={placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ErrorMessage name={name} component="div" className="text-red-400 text-sm mt-1" />
    </div>
  );
}

// Standalone Select component (not for Formik forms)
interface SelectProps {
  id?: string;
  name?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  label?: string;
}

export function StandaloneSelect({ 
  id, 
  name, 
  value, 
  onChange, 
  options, 
  placeholder,
  className = "",
  label
}: SelectProps) {
  return (
    <div>
      {label && (
        <Label htmlFor={id} className="mb-2">
          {label}
        </Label>
      )}
      <Select
        value={value?.toString() || ''}
        onValueChange={(val) => {
          const syntheticEvent = {
            target: { value: val, name: name || '' },
          } as React.ChangeEvent<HTMLSelectElement>;
          onChange(syntheticEvent);
        }}
      >
        <SelectTrigger id={id} className={cn("w-full", className)}>
          <SelectValue placeholder={placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
