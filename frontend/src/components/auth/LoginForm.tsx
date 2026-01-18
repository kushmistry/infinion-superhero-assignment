'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import AuthCard from './AuthCard';
import FormInput from './FormInput';
import FormButton from './FormButton';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .required('Password is required'),
});

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const response = await authAPI.login(values);

      if (response.data.status === 'success') {
        login(response.data.data);
        toast.success('Welcome back! 🎉');
        router.push('/heroes');
      } else {
        const errorMessage = getUserFriendlyErrorMessage(response.data.message || 'Login failed');
        toast.error(errorMessage);
      }
    } catch (error: any) {
      let errorMessage = 'Unable to connect to the server. Please try again.';

      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please wait a few minutes and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error.response?.data?.message) {
        errorMessage = getUserFriendlyErrorMessage(error.response.data.message);
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network and try again.';
      }

      toast.error(errorMessage);
    }
  };

  // Convert technical errors to user-friendly messages
  const getUserFriendlyErrorMessage = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('invalid') && lowerMessage.includes('credential')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (lowerMessage.includes('account') && lowerMessage.includes('not') && lowerMessage.includes('active')) {
      return 'Your account is not active. Please contact support for assistance.';
    }
    if (lowerMessage.includes('email') && lowerMessage.includes('not') && lowerMessage.includes('verified')) {
      return 'Please verify your email address before logging in.';
    }
    if (lowerMessage.includes('too many')) {
      return 'Too many failed attempts. Please wait a few minutes before trying again.';
    }

    // Return the original message if we can't map it to something friendlier
    return message;
  };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, submitForm }) => (
        <AuthCard
          title="Welcome Back"
          subtitle="Sign in to your account"
          submitForm={submitForm}
          footer={(submitForm) => (
            <div>
              <FormButton disabled={isSubmitting} onClick={submitForm}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </FormButton>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-300">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          )}
        >
          <Form className="space-y-5">
            <FormInput
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              label="Email Address"
              required={true}
            />

            <FormInput
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              label="Password"
              required={true}
            />

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>
          </Form>
        </AuthCard>
      )}
    </Formik>
  );
}