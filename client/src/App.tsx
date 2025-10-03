import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import Sleep from './pages/Sleep';
import HeartRate from './pages/HeartRate';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import FitbitCallback from './pages/FitbitCallback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <Activity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sleep"
          element={
            <ProtectedRoute>
              <Sleep />
            </ProtectedRoute>
          }
        />
        <Route
          path="/heart-rate"
          element={
            <ProtectedRoute>
              <HeartRate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fitbit/success"
          element={
            <ProtectedRoute>
              <FitbitCallback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fitbit/error"
          element={
            <ProtectedRoute>
              <FitbitCallback />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
