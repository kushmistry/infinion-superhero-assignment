'use client';

import { Field, ErrorMessage } from 'formik';

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
        <label htmlFor={id} className="block text-sm font-semibold text-gray-200 mb-2">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Field
        id={id}
        name={name}
        type={type}
        className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
        placeholder={placeholder}
      />
      <ErrorMessage name={name} component="div" className="text-red-400 text-sm mt-1" />
    </div>
  );
}