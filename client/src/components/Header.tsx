import { useState, useEffect } from 'react';
import { Bell, ChevronDown, RefreshCw, User } from 'lucide-react';
import { authService } from '../services/auth.service';
import { fitnessService } from '../services/fitnessService';
import type { User as UserType } from '../types/auth.types';

interface HeaderProps {
  title: string;
  subtitle: string;
  showSync?: boolean;
  onSyncComplete?: () => void;
}

const Header = ({ title, subtitle, showSync = true, onSyncComplete }: HeaderProps) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    fetchUser();
  }, []);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncMessage(null);
      await fitnessService.syncTodayData();
      setSyncMessage('Data synced successfully!');

      // Call the callback to refetch data
      if (onSyncComplete) {
        onSyncComplete();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to sync data:', error);
      setSyncMessage('Failed to sync data. Please try again.');
      setTimeout(() => setSyncMessage(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Sync Button */}
          {showSync && (
            <>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Sync Fitbit data"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">{isSyncing ? 'Syncing...' : 'Sync'}</span>
              </button>

              {/* Sync Message */}
              {syncMessage && (
                <div
                  className={`text-sm px-3 py-1 rounded ${
                    syncMessage.includes('success')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {syncMessage}
                </div>
              )}
            </>
          )}

          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              {user?.firstName ? (
                <span className="text-white font-semibold text-sm">
                  {user.firstName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName || 'User'}
              </p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
