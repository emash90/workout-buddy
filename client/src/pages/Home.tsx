import { Link } from 'react-router-dom';
import { Activity, Heart, Moon, TrendingUp, Zap, Shield } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-md shadow-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
                Workout Buddy
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-orange-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-orange-500 to-rose-600 text-white hover:from-orange-400 hover:to-rose-500 px-4 py-2 rounded-md text-sm font-medium transition-all shadow-md shadow-orange-500/30"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Diagonal Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Your Fitness Journey,
              <span className="bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 bg-clip-text text-transparent block mt-2">
                Reimagined
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-xl">
              Track your workouts, monitor your progress, and achieve your fitness goals with intelligent
              insights powered by your Fitbit data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 md:text-lg transition-all shadow-lg shadow-orange-500/30"
              >
                Start Free Trial
                <Zap className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-orange-300 text-base font-medium rounded-full text-gray-700 bg-white/50 hover:bg-white hover:border-orange-400 md:text-lg transition-all backdrop-blur-sm"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Stats Card */}
          <div className="order-1 lg:order-2">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-orange-200/50 transform rotate-2 hover:rotate-0 transition-transform">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center bg-gradient-to-br from-orange-100 to-rose-100 rounded-2xl p-6">
                  <div className="text-4xl font-bold text-orange-700">100K+</div>
                  <div className="text-gray-600 mt-2 text-sm">Active Users</div>
                </div>
                <div className="text-center bg-gradient-to-br from-rose-100 to-amber-100 rounded-2xl p-6">
                  <div className="text-4xl font-bold text-rose-700">500M+</div>
                  <div className="text-gray-600 mt-2 text-sm">Workouts Tracked</div>
                </div>
                <div className="text-center bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-6">
                  <div className="text-4xl font-bold text-amber-700">98%</div>
                  <div className="text-gray-600 mt-2 text-sm">Satisfaction Rate</div>
                </div>
                <div className="text-center bg-gradient-to-br from-rose-100 to-orange-100 rounded-2xl p-6">
                  <div className="text-4xl font-bold text-rose-700">24/7</div>
                  <div className="text-gray-600 mt-2 text-sm">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features to help you track, analyze, and improve your fitness journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-orange-100 to-rose-100 rounded-2xl p-8 border border-orange-200 hover:border-orange-300 transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Activity Tracking</h3>
              <p className="text-gray-600">
                Monitor your daily steps, distance, calories burned, and active minutes with detailed
                visualizations and trends.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 border border-indigo-200 hover:border-indigo-300 transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sleep Analysis</h3>
              <p className="text-gray-600">
                Track your sleep patterns, quality, and efficiency. Get insights into deep sleep, REM, and wake
                times.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl p-8 border border-rose-200 hover:border-rose-300 transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Heart Rate Zones</h3>
              <p className="text-gray-600">
                Monitor your heart rate throughout the day and see time spent in different heart rate zones.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-8 border border-emerald-200 hover:border-emerald-300 transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Progress Analytics</h3>
              <p className="text-gray-600">
                Visualize your progress with interactive charts, weekly summaries, and monthly comparisons.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl p-8 border border-amber-200 hover:border-amber-300 transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fitbit Integration</h3>
              <p className="text-gray-600">
                Seamlessly sync your Fitbit data with one click. Automatic synchronization keeps your data
                up-to-date.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-8 border border-blue-200 hover:border-blue-300 transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Private</h3>
              <p className="text-gray-600">
                Your data is encrypted and secure. We never share your personal information with third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Ready to Transform Your Fitness Journey?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of users who are already tracking their progress and achieving their goals.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-full text-white bg-transparent hover:bg-white hover:text-orange-600 md:text-lg transition-all shadow-lg"
          >
            Get Started Free
            <Zap className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-6 h-6 text-orange-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                  Workout Buddy
                </span>
              </div>
              <p className="text-sm">Your personal fitness tracking companion.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-orange-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} Workout Buddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
