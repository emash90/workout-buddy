import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import type { LoginCredentials } from '../types/auth.types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Only redirect if already authenticated (e.g., returning to login page while logged in)
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginCredentials) => {
    try {
      await login(data);
      // Login successful - the useEffect will handle navigation
    } catch (err) {
      // Error is handled by the store
      // The error message will remain visible because isAuthenticated stays false
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2">
            <Activity className="w-10 h-10 text-emerald-200" />
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-200 via-teal-100 to-cyan-200 bg-clip-text text-transparent">
              Workout Buddy
            </span>
          </div>

          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-emerald-100">
              Sign in to continue tracking your fitness journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                  Email address
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full px-3 py-2 bg-white/10 border rounded-lg shadow-sm text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 sm:text-sm backdrop-blur-sm ${
                    errors.email ? 'border-red-400 focus:border-red-400' : 'border-white/20'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-200">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                  Password
                </label>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`block w-full px-3 py-2 bg-white/10 border rounded-lg shadow-sm text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 sm:text-sm backdrop-blur-sm ${
                    errors.password ? 'border-red-400 focus:border-red-400' : 'border-white/20'
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-200">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-white/20 rounded bg-white/10"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-emerald-200 hover:text-emerald-100">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-emerald-900 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-300 transition-all shadow-lg ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>

            {/* Sign up link */}
            <div className="text-center">
              <span className="text-sm text-emerald-100">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-white hover:text-emerald-100 underline">
                  Sign up for free
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Hero Image/Gradient */}
      <div className="hidden lg:block lg:flex-1 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full blur-3xl opacity-30 -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-30 translate-y-20 -translate-x-20"></div>
        <div className="h-full flex flex-col justify-center px-12 relative z-10">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Track Your Fitness Journey</h2>
          <p className="text-xl mb-8 text-gray-600">
            Monitor your workouts, analyze your progress, and achieve your fitness goals with intelligent
            insights.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-sm text-white">✓</span>
              </div>
              <span className="text-gray-700">Comprehensive activity tracking</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                <span className="text-sm text-white">✓</span>
              </div>
              <span className="text-gray-700">Detailed sleep analysis</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-sm text-white">✓</span>
              </div>
              <span className="text-gray-700">Heart rate monitoring</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-sm text-white">✓</span>
              </div>
              <span className="text-gray-700">Progress visualizations</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
