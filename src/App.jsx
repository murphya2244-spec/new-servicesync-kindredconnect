import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Landing from './pages/Landing';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventsPage from './pages/EventsPage';
import MySignups from './pages/MySignups';
import AdminEvents from './pages/AdminEvents';
import AdminEventForm from './pages/AdminEventForm';
import AdminVolunteers from './pages/AdminVolunteers';
import VolunteerProfile from './pages/VolunteerProfile.jsx';
import EventDetails from './pages/EventDetails';
import AdminEventRoster from './pages/AdminEventRoster';
import CalendarPage from './pages/CalendarPage';
import MessagingPage from './pages/MessagingPage';
import AdminAnalytics from './pages/AdminAnalytics';
import DemoPage from './pages/DemoPage';
import AchievementsPage from './pages/AchievementsPage';

const NPOGuard = ({ children }) => {
  const { user, isLoadingAuth, navigateToLogin } = useAuth();
  if (isLoadingAuth) return null;
  if (!user) {
    navigateToLogin();
    return null;
  }
  if (user.role === "volunteer" || !user.role) {
    return <Navigate to="/volunteer-dashboard" replace />;
  }
  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/my-signups" element={<MySignups />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/messages" element={<MessagingPage />} />
      <Route path="/profile" element={<VolunteerProfile />} />
      {/* NPO-only routes — volunteers are redirected away */}
      <Route path="/admin-dashboard" element={<NPOGuard><AdminDashboard /></NPOGuard>} />
      <Route path="/admin/events" element={<NPOGuard><AdminEvents /></NPOGuard>} />
      <Route path="/admin/events/new" element={<NPOGuard><AdminEventForm /></NPOGuard>} />
      <Route path="/admin/events/:id" element={<NPOGuard><AdminEventForm /></NPOGuard>} />
      <Route path="/admin/events/:id/roster" element={<NPOGuard><AdminEventRoster /></NPOGuard>} />
      <Route path="/admin/analytics" element={<NPOGuard><AdminAnalytics /></NPOGuard>} />
      <Route path="/admin/volunteers" element={<NPOGuard><AdminVolunteers /></NPOGuard>} />
      <Route path="/achievements" element={<AchievementsPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App