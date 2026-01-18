'use client';

import Link from 'next/link';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { authAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import AuthCard from './AuthCard';
import FormInput from './FormInput';
import FormButton from './FormButton';

export default function ForgotPasswordForm() {
  // Convert technical errors to user-friendly messages
  const getUserFriendlyErrorMessage = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('email') && lowerMessage.includes('not') && lowerMessage.includes('found')) {
      return 'No account found with this email address. Please check your email or create a new account.';
    }
    if (lowerMessage.includes('invalid') && lowerMessage.includes('email')) {
      return 'Please enter a valid email address.';
    }
    if (lowerMessage.includes('rate') && lowerMessage.includes('limit')) {
      return 'Too many reset requests. Please wait a few minutes before trying again.';
    }

    // Return the original message if we can't map it to something friendlier
    return message;
  };

  return (
    <Formik
      initialValues={{ email: '' }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('Invalid email address')
          .required('Email is required'),
      })}
      onSubmit={async (values, { resetForm }) => {
        try {
          const response = await authAPI.forgotPassword(values);
          
          // Check for success status
          if (response.data?.status === 'success') {
            resetForm(); // Clear the form
            toast.success('Password reset email sent! 📧 Please check your inbox and spam folder.');
          } else {
            // Handle error response
            const errorMessage = getUserFriendlyErrorMessage(response.data?.message || 'Failed to send reset email');
            toast.error(errorMessage);
          }
        } catch (error: any) {
          let errorMessage = 'Unable to send reset email. Please try again.';

          if (error.response?.status === 404) {
            errorMessage = 'No account found with this email address. Please check your email or create a new account.';
          } else if (error.response?.status === 429) {
            errorMessage = 'Too many reset requests. Please wait a few minutes before trying again.';
          } else if (error.response?.status >= 500) {
            errorMessage = 'Server error. Please try again in a few moments.';
          } else if (error.response?.data?.message) {
            errorMessage = getUserFriendlyErrorMessage(error.response.data.message);
          } else if (!navigator.onLine) {
            errorMessage = 'No internet connection. Please check your network and try again.';
          }

          toast.error(errorMessage);
        }
      }}
    >
      {({ isSubmitting, submitForm }) => (
        <AuthCard
          title="Forgot Password"
          subtitle="Enter your email address and we'll send you a reset link"
          submitForm={submitForm}
          footer={(submitForm) => (
            <div>
              <FormButton disabled={isSubmitting} onClick={submitForm}>
                {isSubmitting ? 'Sending reset link...' : 'Send Reset Link'}
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
            <FormInput
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              label="Email Address"
              required={true}
            />
          </Form>
        </AuthCard>
      )}
    </Formik>
  );
}