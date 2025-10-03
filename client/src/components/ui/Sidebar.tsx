import { Link, useLocation } from 'react-router-dom';
import { Activity, Heart, Moon, BarChart3, Home, Settings, LogOut } from 'lucide-react';
import { authService } from '../../services/auth.service';

export const Sidebar = () => {
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Overview' },
    { path: '/activity', icon: Activity, label: 'Activity' },
    { path: '/sleep', icon: Moon, label: 'Sleep' },
    { path: '/heart-rate', icon: Heart, label: 'Heart Rate' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center space-x-2 mb-8">
          <Activity className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Workout Buddy
          </span>
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <Link
            to="/settings"
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
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
  );
};
