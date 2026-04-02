import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/my-signups" element={<MySignups />} />
      <Route path="/admin/events" element={<AdminEvents />} />
      <Route path="/admin/events/new" element={<AdminEventForm />} />
      <Route path="/admin/events/:id" element={<AdminEventForm />} />
      <Route path="/admin/events/:id/roster" element={<AdminEventRoster />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/messages" element={<MessagingPage />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/admin/volunteers" element={<AdminVolunteers />} />
      <Route path="/profile" element={<VolunteerProfile />} />
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