'use client';

import { Field, ErrorMessage } from 'formik';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormInputProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  label?: string;
  required?: boolean;
}

export default function FormInput({ id, name, type, placeholder, label, required = false }: FormInputProps) {
  return (
    <div>
      {label && (
        <Label htmlFor={id} className="mb-2">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Field
        as={Input}
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full"
      />
      <ErrorMessage name={name} component="div" className="text-red-400 text-sm mt-1" />
    </div>
  );
}