'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { authAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import AuthCard from './AuthCard';
import FormButton from './FormButton';

export default function ResetPasswordForm() {
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('No reset token provided');
      router.push('/login');
      return;
    }

    // Verify token validity
    const verifyToken = async () => {
      try {
        const response = await authAPI.verifyResetToken({ token });
        if (response.data.status === 'success') {
          setTokenValid(response.data.data.valid);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        setTokenValid(false);
        toast.error('Invalid reset token');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, router]);

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    try {
      const response = await authAPI.resetPassword({
        token: token!,
        new_password: values.password,
      });

      if (response.data?.status === 'success') {
        toast.success('Password reset successfully! You can now log in.');
        router.push('/login');
      } else {
        toast.error(response.data?.message || 'Failed to reset password');
      }
    } catch (error: any) {
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your input and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Reset token is invalid or expired. Please request a new reset link.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again in a few moments.';
      }

      toast.error(errorMessage);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-purple-200">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-purple-500/30 rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invalid reset link</h1>
          <p className="text-purple-300 text-sm mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Formik
      initialValues={{ password: '', confirmPassword: '' }}
      validationSchema={Yup.object().shape({
        password: Yup.string()
          .min(8, 'Password must be at least 8 characters')
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
          )
          .required('Password is required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password')], 'Passwords must match')
          .required('Please confirm your password'),
      })}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, submitForm }) => (
        <AuthCard
          title="Reset Password"
          subtitle="Enter your new password below"
          submitForm={submitForm}
          footer={(submitForm) => (
            <div>
              <FormButton disabled={isSubmitting} onClick={submitForm}>
                {isSubmitting ? 'Resetting password...' : 'Reset Password'}
              </FormButton>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Back to sign in
                </Link>
              </div>
            </div>
          )}
        >
          <Form className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-2">
                New Password<span className="text-red-500 ml-1">*</span>
              </label>
              <Field
                id="password"
                name="password"
                type="password"
                className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="Enter your new password"
              />
              <ErrorMessage name="password" component="div" className="text-red-400 text-sm mt-1" />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-200 mb-2">
                Confirm Password<span className="text-red-500 ml-1">*</span>
              </label>
              <Field
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="Confirm your new password"
              />
              <ErrorMessage name="confirmPassword" component="div" className="text-red-400 text-sm mt-1" />
            </div>
          </Form>
        </AuthCard>
      )}
    </Formik>
  );
}