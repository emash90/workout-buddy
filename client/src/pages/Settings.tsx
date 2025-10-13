import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Heart,
  Moon,
  BarChart3,
  Home,
  Settings as SettingsIcon,
  User,
  LogOut,
  Bell,
  ChevronDown,
  ChevronRight,
  Shield,
  Palette,
  Globe,
  Clock,
  Target,
  Zap,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingDown,
  TrendingUp,
  Footprints,
  Flame,
  Timer,
  Sparkles,
  Info,
  Scale,
  Ruler,
  Calendar,
} from 'lucide-react';
import { authService } from '../services/auth.service';
import { fitbitService } from '../services/fitbitService';
import type { FitbitConnectionStatus } from '../services/fitbitService';
import { whoopService } from '../services/whoopService';
import type { WhoopConnectionStatus } from '../services/whoopService';
import {
  goalsService,
  FitnessGoal,
  ActivityLevel,
  type UserGoals,
  type BMIInfo,
} from '../services/goalsService';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  // Fitbit connection state
  const [fitbitStatus, setFitbitStatus] = useState<FitbitConnectionStatus | null>(null);
  const [isLoadingFitbit, setIsLoadingFitbit] = useState(true);
  const [isConnectingFitbit, setIsConnectingFitbit] = useState(false);
  const [isDisconnectingFitbit, setIsDisconnectingFitbit] = useState(false);

  // Whoop connection state
  const [whoopStatus, setWhoopStatus] = useState<WhoopConnectionStatus | null>(null);
  const [isLoadingWhoop, setIsLoadingWhoop] = useState(true);
  const [isConnectingWhoop, setIsConnectingWhoop] = useState(false);
  const [isDisconnectingWhoop, setIsDisconnectingWhoop] = useState(false);

  const handleLogout = () => {
    authService.logout();
  };

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    goals: true,
    achievements: true,
    weeklyReport: false,
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    distanceUnit: 'km',
    weightUnit: 'kg',
  });

  // User profile state
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Goals state
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [isSavingGoals, setIsSavingGoals] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [bmiInfo, setBmiInfo] = useState<BMIInfo | null>(null);
  const [goalsForm, setGoalsForm] = useState({
    fitnessGoal: FitnessGoal.GENERAL_FITNESS,
    currentWeight: '',
    targetWeight: '',
    height: '',
    age: '',
    gender: 'male',
    activityLevel: ActivityLevel.MODERATELY_ACTIVE,
    dailyStepsGoal: 10000,
    dailyCaloriesBurnGoal: 500,
    dailyActiveMinutesGoal: 30,
    dailySleepHoursGoal: 8,
    weeklyWorkoutsGoal: 4,
    aiRecommendationsEnabled: false,
  });

  // Load device connection status
  useEffect(() => {
    loadDeviceStatus();
  }, []);

  const loadDeviceStatus = async () => {
    await Promise.all([loadFitbitStatus(), loadWhoopStatus()]);
  };

  const loadFitbitStatus = async () => {
    try {
      setIsLoadingFitbit(true);
      const status = await fitbitService.getConnectionStatus();
      setFitbitStatus(status);
    } catch (error) {
      console.error('Failed to load Fitbit status:', error);
    } finally {
      setIsLoadingFitbit(false);
    }
  };

  const loadWhoopStatus = async () => {
    try {
      setIsLoadingWhoop(true);
      const status = await whoopService.getConnectionStatus();
      setWhoopStatus(status);
    } catch (error) {
      console.error('Failed to load Whoop status:', error);
    } finally {
      setIsLoadingWhoop(false);
    }
  };

  const handleConnectFitbit = async () => {
    try {
      setIsConnectingFitbit(true);
      await fitbitService.initiateConnection();
    } catch (error) {
      console.error('Failed to connect Fitbit:', error);
      alert('Failed to connect to Fitbit. Please try again.');
      setIsConnectingFitbit(false);
    }
  };

  const handleDisconnectFitbit = async () => {
    if (!confirm('Are you sure you want to disconnect your Fitbit device?')) {
      return;
    }

    try {
      setIsDisconnectingFitbit(true);
      await fitbitService.disconnect();
      setFitbitStatus({ connected: false });
      await loadWhoopStatus(); // Reload Whoop status after disconnecting Fitbit
    } catch (error) {
      console.error('Failed to disconnect Fitbit:', error);
      alert('Failed to disconnect Fitbit. Please try again.');
    } finally {
      setIsDisconnectingFitbit(false);
    }
  };

  const handleConnectWhoop = async () => {
    try {
      setIsConnectingWhoop(true);
      await whoopService.initiateConnection();
    } catch (error) {
      console.error('Failed to connect Whoop:', error);
      alert('Failed to connect to Whoop. Please try again.');
      setIsConnectingWhoop(false);
    }
  };

  const handleDisconnectWhoop = async () => {
    if (!confirm('Are you sure you want to disconnect your Whoop device?')) {
      return;
    }

    try {
      setIsDisconnectingWhoop(true);
      await whoopService.disconnect();
      setWhoopStatus({ connected: false });
      await loadFitbitStatus(); // Reload Fitbit status after disconnecting Whoop
    } catch (error) {
      console.error('Failed to disconnect Whoop:', error);
      alert('Failed to disconnect Whoop. Please try again.');
    } finally {
      setIsDisconnectingWhoop(false);
    }
  };

  // Load profile when on profile section
  useEffect(() => {
    if (activeSection === 'profile') {
      loadProfile();
    }
  }, [activeSection]);

  // Load goals when on goals section
  useEffect(() => {
    if (activeSection === 'goals') {
      loadGoals();
    }
  }, [activeSection]);

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const profile = await authService.getProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadGoals = async () => {
    try {
      setIsLoadingGoals(true);
      const userGoals = await goalsService.getGoals();
      setGoals(userGoals);

      // Populate form with existing goals
      setGoalsForm({
        fitnessGoal: userGoals.fitnessGoal || FitnessGoal.GENERAL_FITNESS,
        currentWeight: userGoals.currentWeight?.toString() || '',
        targetWeight: userGoals.targetWeight?.toString() || '',
        height: userGoals.height?.toString() || '',
        age: userGoals.age?.toString() || '',
        gender: userGoals.gender || 'male',
        activityLevel: userGoals.activityLevel || ActivityLevel.MODERATELY_ACTIVE,
        dailyStepsGoal: userGoals.dailyStepsGoal || 10000,
        dailyCaloriesBurnGoal: userGoals.dailyCaloriesBurnGoal || 500,
        dailyActiveMinutesGoal: userGoals.dailyActiveMinutesGoal || 30,
        dailySleepHoursGoal: userGoals.dailySleepHoursGoal || 8,
        weeklyWorkoutsGoal: userGoals.weeklyWorkoutsGoal || 4,
        aiRecommendationsEnabled: userGoals.aiRecommendationsEnabled || false,
      });

      // Calculate BMI if data available
      if (userGoals.currentWeight && userGoals.height) {
        const bmi = await goalsService.calculateBMI(userGoals.currentWeight, userGoals.height);
        setBmiInfo(bmi);
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
      // No goals set yet, that's okay
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const handleSaveGoals = async () => {
    try {
      setIsSavingGoals(true);

      const goalsData = {
        fitnessGoal: goalsForm.fitnessGoal,
        currentWeight: goalsForm.currentWeight ? parseFloat(goalsForm.currentWeight) : undefined,
        targetWeight: goalsForm.targetWeight ? parseFloat(goalsForm.targetWeight) : undefined,
        height: goalsForm.height ? parseFloat(goalsForm.height) : undefined,
        age: goalsForm.age ? parseInt(goalsForm.age) : undefined,
        gender: goalsForm.gender,
        activityLevel: goalsForm.activityLevel,
        dailyStepsGoal: Number(goalsForm.dailyStepsGoal),
        dailyCaloriesBurnGoal: Number(goalsForm.dailyCaloriesBurnGoal),
        dailyActiveMinutesGoal: Number(goalsForm.dailyActiveMinutesGoal),
        dailySleepHoursGoal: Number(goalsForm.dailySleepHoursGoal),
        weeklyWorkoutsGoal: Number(goalsForm.weeklyWorkoutsGoal),
        aiRecommendationsEnabled: goalsForm.aiRecommendationsEnabled,
      };

      const updatedGoals = goals
        ? await goalsService.updateGoals(goalsData)
        : await goalsService.createGoals(goalsData);

      setGoals(updatedGoals);

      // Update form with saved values
      setGoalsForm({
        fitnessGoal: updatedGoals.fitnessGoal || FitnessGoal.GENERAL_FITNESS,
        currentWeight: updatedGoals.currentWeight?.toString() || '',
        targetWeight: updatedGoals.targetWeight?.toString() || '',
        height: updatedGoals.height?.toString() || '',
        age: updatedGoals.age?.toString() || '',
        gender: updatedGoals.gender || 'male',
        activityLevel: updatedGoals.activityLevel || ActivityLevel.MODERATELY_ACTIVE,
        dailyStepsGoal: updatedGoals.dailyStepsGoal || 10000,
        dailyCaloriesBurnGoal: updatedGoals.dailyCaloriesBurnGoal || 500,
        dailyActiveMinutesGoal: updatedGoals.dailyActiveMinutesGoal || 30,
        dailySleepHoursGoal: updatedGoals.dailySleepHoursGoal || 8,
        weeklyWorkoutsGoal: updatedGoals.weeklyWorkoutsGoal || 4,
        aiRecommendationsEnabled: updatedGoals.aiRecommendationsEnabled || false,
      });

      // Calculate BMI if weight and height provided
      if (goalsData.currentWeight && goalsData.height) {
        const bmi = await goalsService.calculateBMI(goalsData.currentWeight, goalsData.height);
        setBmiInfo(bmi);
      }

      alert('Goals saved successfully!');
    } catch (error: any) {
      console.error('Failed to save goals:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to save goals: ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setIsSavingGoals(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      setIsGeneratingRecommendations(true);
      const recommendations = await goalsService.generateAIRecommendations();

      // Update form with AI recommendations
      if (recommendations) {
        setGoalsForm((prev) => ({
          ...prev,
          dailyStepsGoal: recommendations.dailySteps || prev.dailyStepsGoal,
          dailyCaloriesBurnGoal: recommendations.dailyCaloriesBurn || prev.dailyCaloriesBurnGoal,
          dailyActiveMinutesGoal: recommendations.dailyActiveMinutes || prev.dailyActiveMinutesGoal,
          dailySleepHoursGoal: recommendations.dailySleepHours || prev.dailySleepHoursGoal,
          weeklyWorkoutsGoal: recommendations.weeklyWorkouts || prev.weeklyWorkoutsGoal,
        }));

        alert('AI recommendations generated! Review and save your goals.');
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      alert('Failed to generate AI recommendations. Please make sure you have filled in your physical information.');
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const sections = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'account', name: 'Account', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: Palette },
    { id: 'goals', name: 'Goals & Targets', icon: Target },
    { id: 'devices', name: 'Connected Devices', icon: Smartphone },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center space-x-2 mb-8">
            <Activity className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Workout Buddy
            </span>
          </Link>

          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </Link>

            <Link
              to="/activity"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium">Activity</span>
            </Link>

            <Link
              to="/sleep"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              <Moon className="w-5 h-5" />
              <span className="font-medium">Sleep</span>
            </Link>

            <Link
              to="/heart-rate"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              <Heart className="w-5 h-5" />
              <span className="font-medium">Heart Rate</span>
            </Link>

            <Link
              to="/analytics"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Analytics</span>
            </Link>
          </nav>

          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <Link
              to="/settings"
              className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg transition-colors"
            >
              <SettingsIcon className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your account and preferences
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">User</p>
                  <p className="text-xs text-gray-500">Free Plan</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Settings Content */}
        <div className="flex">
          {/* Settings Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <section.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{section.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </nav>
          </aside>

          {/* Settings Content Area */}
          <div className="flex-1 p-8">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

                {isLoadingProfile ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center space-x-6 mb-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <User className="w-12 h-12 text-white" />
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                          <Zap className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Profile Picture</h3>
                        <p className="text-sm text-gray-500 mb-2">
                          JPG, GIF or PNG. Max size of 2MB
                        </p>
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                          Upload new photo
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={userProfile?.firstName || ''}
                            readOnly
                            placeholder="Not set"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={userProfile?.lastName || ''}
                            readOnly
                            placeholder="Not set"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={userProfile?.email || ''}
                          readOnly
                          placeholder="Not set"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          <strong>Account Created:</strong> {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900">
                        <strong>Note:</strong> Profile editing is not yet available. This feature will be added in a future update.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Account Section */}
            {activeSection === 'account' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                  <h3 className="text-lg font-bold text-red-900 mb-2">Delete Account</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Notification Preferences
                </h2>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="space-y-4">
                    {[
                      {
                        key: 'email',
                        label: 'Email Notifications',
                        description: 'Receive updates via email',
                        icon: Mail,
                      },
                      {
                        key: 'push',
                        label: 'Push Notifications',
                        description: 'Receive push notifications on your device',
                        icon: Bell,
                      },
                      {
                        key: 'goals',
                        label: 'Goal Reminders',
                        description: 'Get notified about your daily goals',
                        icon: Target,
                      },
                      {
                        key: 'achievements',
                        label: 'Achievement Alerts',
                        description: 'Celebrate when you unlock achievements',
                        icon: Zap,
                      },
                      {
                        key: 'weeklyReport',
                        label: 'Weekly Summary',
                        description: 'Get a weekly report of your progress',
                        icon: BarChart3,
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <item.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setNotifications({
                              ...notifications,
                              [item.key]: !notifications[item.key as keyof typeof notifications],
                            })
                          }
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            notifications[item.key as keyof typeof notifications]
                              ? 'bg-blue-600'
                              : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                              notifications[item.key as keyof typeof notifications]
                                ? 'translate-x-6'
                                : 'translate-x-0'
                            }`}
                          ></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">App Preferences</h2>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Palette className="w-4 h-4" />
                        <span>Theme</span>
                      </div>
                    </label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>Language</span>
                      </div>
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) =>
                        setPreferences({ ...preferences, language: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Timezone</span>
                      </div>
                    </label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) =>
                        setPreferences({ ...preferences, timezone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distance Unit
                      </label>
                      <select
                        value={preferences.distanceUnit}
                        onChange={(e) =>
                          setPreferences({ ...preferences, distanceUnit: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="km">Kilometers</option>
                        <option value="mi">Miles</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight Unit
                      </label>
                      <select
                        value={preferences.weightUnit}
                        onChange={(e) =>
                          setPreferences({ ...preferences, weightUnit: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="kg">Kilograms</option>
                        <option value="lb">Pounds</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Goals Section */}
            {activeSection === 'goals' && (
              <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Goals & Targets</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Set your fitness goals and let AI help you achieve them
                    </p>
                  </div>
                  {goals?.aiRecommendationsEnabled && (
                    <button
                      onClick={handleGenerateRecommendations}
                      disabled={isGeneratingRecommendations}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingRecommendations ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Get AI Recommendations</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {isLoadingGoals ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Fitness Goal Selection */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-2 mb-4">
                        <Target className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">Your Fitness Goal</h3>
                      </div>

                      <select
                        value={goalsForm.fitnessGoal}
                        onChange={(e) => setGoalsForm({ ...goalsForm, fitnessGoal: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      >
                        <option value={FitnessGoal.LOSE_WEIGHT}>🔥 Lose Weight</option>
                        <option value={FitnessGoal.GAIN_MUSCLE}>💪 Gain Muscle</option>
                        <option value={FitnessGoal.MAINTAIN_WEIGHT}>⚖️ Maintain Weight</option>
                        <option value={FitnessGoal.IMPROVE_ENDURANCE}>🏃 Improve Endurance</option>
                        <option value={FitnessGoal.GENERAL_FITNESS}>✨ General Fitness</option>
                      </select>
                    </div>

                    {/* Physical Information */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-2 mb-4">
                        <User className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">Physical Information</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <Scale className="w-4 h-4" />
                            <span>Current Weight (kg)</span>
                          </label>
                          <input
                            type="number"
                            value={goalsForm.currentWeight}
                            onChange={(e) => setGoalsForm({ ...goalsForm, currentWeight: e.target.value })}
                            placeholder="70"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <Target className="w-4 h-4" />
                            <span>Target Weight (kg)</span>
                          </label>
                          <input
                            type="number"
                            value={goalsForm.targetWeight}
                            onChange={(e) => setGoalsForm({ ...goalsForm, targetWeight: e.target.value })}
                            placeholder="65"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <Ruler className="w-4 h-4" />
                            <span>Height (cm)</span>
                          </label>
                          <input
                            type="number"
                            value={goalsForm.height}
                            onChange={(e) => setGoalsForm({ ...goalsForm, height: e.target.value })}
                            placeholder="170"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span>Age</span>
                          </label>
                          <input
                            type="number"
                            value={goalsForm.age}
                            onChange={(e) => setGoalsForm({ ...goalsForm, age: e.target.value })}
                            placeholder="30"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                          </label>
                          <select
                            value={goalsForm.gender}
                            onChange={(e) => setGoalsForm({ ...goalsForm, gender: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Activity Level
                        </label>
                        <select
                          value={goalsForm.activityLevel}
                          onChange={(e) => setGoalsForm({ ...goalsForm, activityLevel: e.target.value as any })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={ActivityLevel.SEDENTARY}>Sedentary (little or no exercise)</option>
                          <option value={ActivityLevel.LIGHTLY_ACTIVE}>Lightly Active (1-3 days/week)</option>
                          <option value={ActivityLevel.MODERATELY_ACTIVE}>Moderately Active (3-5 days/week)</option>
                          <option value={ActivityLevel.VERY_ACTIVE}>Very Active (6-7 days/week)</option>
                          <option value={ActivityLevel.EXTRA_ACTIVE}>Extra Active (athlete/physical job)</option>
                        </select>
                      </div>

                      {/* BMI Info */}
                      {bmiInfo && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start space-x-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Your BMI: <span className="text-blue-600">{bmiInfo.bmi.toFixed(1)}</span> ({bmiInfo.category})
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Ideal weight range: {bmiInfo.idealWeightRange.min.toFixed(1)} - {bmiInfo.idealWeightRange.max.toFixed(1)} kg
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Daily & Weekly Targets */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Target className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-bold text-gray-900">Daily & Weekly Targets</h3>
                        </div>
                        {goals?.aiRecommendations && (
                          <span className="text-xs text-purple-600 flex items-center space-x-1">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Suggested</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                              <Footprints className="w-4 h-4" />
                              <span>Daily Steps Goal</span>
                            </label>
                            <span className="text-sm text-gray-500">{goalsForm.dailyStepsGoal.toLocaleString()} steps</span>
                          </div>
                          <input
                            type="number"
                            value={goalsForm.dailyStepsGoal}
                            onChange={(e) => setGoalsForm({ ...goalsForm, dailyStepsGoal: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                              <Flame className="w-4 h-4" />
                              <span>Daily Calories Burn Goal</span>
                            </label>
                            <span className="text-sm text-gray-500">{goalsForm.dailyCaloriesBurnGoal} kcal</span>
                          </div>
                          <input
                            type="number"
                            value={goalsForm.dailyCaloriesBurnGoal}
                            onChange={(e) => setGoalsForm({ ...goalsForm, dailyCaloriesBurnGoal: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                              <Timer className="w-4 h-4" />
                              <span>Daily Active Minutes</span>
                            </label>
                            <span className="text-sm text-gray-500">{goalsForm.dailyActiveMinutesGoal} min</span>
                          </div>
                          <input
                            type="number"
                            value={goalsForm.dailyActiveMinutesGoal}
                            onChange={(e) => setGoalsForm({ ...goalsForm, dailyActiveMinutesGoal: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                              <Moon className="w-4 h-4" />
                              <span>Daily Sleep Hours</span>
                            </label>
                            <span className="text-sm text-gray-500">{goalsForm.dailySleepHoursGoal} hours</span>
                          </div>
                          <input
                            type="number"
                            step="0.5"
                            value={goalsForm.dailySleepHoursGoal}
                            onChange={(e) => setGoalsForm({ ...goalsForm, dailySleepHoursGoal: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                              <Activity className="w-4 h-4" />
                              <span>Weekly Workouts</span>
                            </label>
                            <span className="text-sm text-gray-500">{goalsForm.weeklyWorkoutsGoal} workouts</span>
                          </div>
                          <input
                            type="number"
                            value={goalsForm.weeklyWorkoutsGoal}
                            onChange={(e) => setGoalsForm({ ...goalsForm, weeklyWorkoutsGoal: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendations Toggle */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">AI-Powered Recommendations</div>
                            <div className="text-sm text-gray-600">Get personalized goal suggestions based on your profile</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setGoalsForm({ ...goalsForm, aiRecommendationsEnabled: !goalsForm.aiRecommendationsEnabled })}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            goalsForm.aiRecommendationsEnabled ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                              goalsForm.aiRecommendationsEnabled ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          ></div>
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => loadGoals()}
                        className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveGoals}
                        disabled={isSavingGoals}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {isSavingGoals && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{isSavingGoals ? 'Saving...' : 'Save Goals'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Devices Section */}
            {activeSection === 'devices' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Connected Devices</h2>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="font-medium text-gray-900">Fitbit Device</div>
                          {isLoadingFitbit ? (
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          ) : fitbitStatus?.connected ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {isLoadingFitbit
                            ? 'Loading...'
                            : fitbitStatus?.connected
                            ? `Connected${
                                fitbitStatus.connectedAt
                                  ? ` on ${new Date(fitbitStatus.connectedAt).toLocaleDateString()}`
                                  : ''
                              }`
                            : 'Not connected'}
                        </div>
                        {fitbitStatus?.connected && fitbitStatus.fitbitUserId && (
                          <div className="text-xs text-gray-400 mt-1">
                            User ID: {fitbitStatus.fitbitUserId}
                          </div>
                        )}
                      </div>
                    </div>
                    {fitbitStatus?.connected ? (
                      <button
                        onClick={handleDisconnectFitbit}
                        disabled={isDisconnectingFitbit}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isDisconnectingFitbit && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{isDisconnectingFitbit ? 'Disconnecting...' : 'Disconnect'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleConnectFitbit}
                        disabled={isConnectingFitbit || isLoadingFitbit || whoopStatus?.connected}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isConnectingFitbit && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{isConnectingFitbit ? 'Connecting...' : 'Connect'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Whoop Device */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="font-medium text-gray-900">Whoop Device</div>
                          {isLoadingWhoop ? (
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          ) : whoopStatus?.connected ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {isLoadingWhoop
                            ? 'Loading...'
                            : whoopStatus?.connected
                            ? `Connected${
                                whoopStatus.connectedAt
                                  ? ` on ${new Date(whoopStatus.connectedAt).toLocaleDateString()}`
                                  : ''
                              }`
                            : 'Not connected'}
                        </div>
                        {whoopStatus?.connected && whoopStatus.whoopUserId && (
                          <div className="text-xs text-gray-400 mt-1">
                            User ID: {whoopStatus.whoopUserId}
                          </div>
                        )}
                      </div>
                    </div>
                    {whoopStatus?.connected ? (
                      <button
                        onClick={handleDisconnectWhoop}
                        disabled={isDisconnectingWhoop}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isDisconnectingWhoop && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{isDisconnectingWhoop ? 'Disconnecting...' : 'Disconnect'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleConnectWhoop}
                        disabled={isConnectingWhoop || isLoadingWhoop || fitbitStatus?.connected}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isConnectingWhoop && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{isConnectingWhoop ? 'Connecting...' : 'Connect'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> You can only connect one device at a time. Connect your Fitbit or Whoop device to automatically sync your fitness data and get personalized insights.
                  </p>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy & Security</h2>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-500">Add an extra layer of security</div>
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Shield className="w-4 h-4" />
                      <span>Enable</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Data Export</div>
                      <div className="text-sm text-gray-500">Download all your fitness data</div>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                      Export
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Privacy Settings</div>
                      <div className="text-sm text-gray-500">Control who can see your data</div>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
