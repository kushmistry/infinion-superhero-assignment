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

const registerSchema = Yup.object().shape({
  first_name: Yup.string()
    .min(2, 'First name must be at least 2 characters long')
    .required('First name is required'),
  last_name: Yup.string()
    .min(2, 'Last name must be at least 2 characters long')
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

export default function RegisterForm() {
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (values: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await authAPI.register(values);

      if (response.data.status === 'success') {
        toast.success('Account created successfully! Welcome to SuperHero Hub! 🎉');
        // Auto-login after registration
        const loginResponse = await authAPI.login({
          email: values.email,
          password: values.password,
        });

        if (loginResponse.data.status === 'success') {
          login(loginResponse.data.data);
          router.push('/heroes');
        }
      } else {
        const errorMessage = getUserFriendlyErrorMessage(response.data.message || 'Registration failed');
        toast.error(errorMessage);
      }
    } catch (error: any) {
      let errorMessage = 'Unable to create your account. Please try again.';

      if (error.response?.status === 409) {
        errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Please check your information and try again. Some fields may be invalid.';
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

    if (lowerMessage.includes('email') && lowerMessage.includes('already') && lowerMessage.includes('exists')) {
      return 'This email address is already registered. Please use a different email or try logging in.';
    }
    if (lowerMessage.includes('username') && lowerMessage.includes('already') && lowerMessage.includes('exists')) {
      return 'This username is already taken. Please choose a different username.';
    }
    if (lowerMessage.includes('password') && lowerMessage.includes('weak')) {
      return 'Please choose a stronger password with at least 8 characters, including uppercase, lowercase, and numbers.';
    }
    if (lowerMessage.includes('invalid') && lowerMessage.includes('email')) {
      return 'Please enter a valid email address.';
    }

    // Return the original message if we can't map it to something friendlier
    return message;
  };

  return (
    <Formik
        initialValues={{
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          confirmPassword: '',
        }}
      validationSchema={registerSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, submitForm }) => (
        <AuthCard
          title="Create Account"
          subtitle="Join the superhero community"
          submitForm={submitForm}
          footer={(submitForm) => (
            <div>
              <FormButton disabled={isSubmitting} onClick={submitForm}>
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </FormButton>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-300">
                  Already have an account?{' '}
                  <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          )}
        >
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                id="first_name"
                name="first_name"
                type="text"
                placeholder="John"
                label="First Name"
                required={true}
              />

              <FormInput
                id="last_name"
                name="last_name"
                type="text"
                placeholder="Doe"
                label="Last Name"
                required={true}
              />
            </div>

            <FormInput
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              label="Email Address"
              required={true}
            />

            <FormInput
              id="password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              label="Password"
              required={true}
            />

            <FormInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              label="Confirm Password"
              required={true}
            />
          </Form>
        </AuthCard>
      )}
    </Formik>
  );
}