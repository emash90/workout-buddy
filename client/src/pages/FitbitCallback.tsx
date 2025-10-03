import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const FitbitCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if this is a success or error callback
    const path = location.pathname;
    const params = new URLSearchParams(location.search);

    if (path.includes('/fitbit/success')) {
      setStatus('success');
      setMessage('Your Fitbit device has been connected successfully!');
      // Redirect to settings after 2 seconds
      setTimeout(() => {
        navigate('/settings', { replace: true });
      }, 2000);
    } else if (path.includes('/fitbit/error')) {
      setStatus('error');
      const errorMessage = params.get('message') || 'Failed to connect Fitbit device';
      setMessage(errorMessage.replace(/_/g, ' '));
      // Redirect to settings after 3 seconds
      setTimeout(() => {
        navigate('/settings', { replace: true });
      }, 3000);
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h2>
              <p className="text-gray-600">Please wait while we connect your Fitbit device</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-4">Redirecting to settings...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Failed</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to settings...</p>
              <button
                onClick={() => navigate('/settings', { replace: true })}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Settings
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FitbitCallback;
