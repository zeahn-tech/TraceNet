import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/auth';
import { useUIStore } from './store/ui';
import { SplashPage } from './pages/SplashPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { AppLayout } from './components/layouts/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { SearchPage } from './pages/SearchPage';
import { AlertsPage } from './pages/AlertsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { MissingPersonsListPage } from './pages/missing/MissingPersonsListPage';
import { MissingPersonDetailPage } from './pages/missing/MissingPersonDetailPage';
import { MissingPersonCreatePage } from './pages/missing/MissingPersonCreatePage';
import { WantedPersonsListPage } from './pages/wanted/WantedPersonsListPage';
import { WantedPersonDetailPage } from './pages/wanted/WantedPersonDetailPage';
import { ReportsListPage } from './pages/reports/ReportsListPage';
import { ReportCreatePage } from './pages/reports/ReportCreatePage';
import { ReportDetailPage } from './pages/reports/ReportDetailPage';
import { AdminPage } from './pages/admin/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const init = useAuthStore((s) => s.init);
  const hasOnboarded = useUIStore((s) => s.hasOnboarded);
  const [onboarded, setOnboarded] = useState(hasOnboarded);

  useEffect(() => {
    init();
  }, [init]);

  if (showSplash) {
    return <SplashPage onDone={() => setShowSplash(false)} />;
  }

  if (!onboarded) {
    return <OnboardingPage onDone={() => setOnboarded(true)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/TraceNet">
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="admin" element={<AdminPage />} />

              <Route path="missing" element={<MissingPersonsListPage />} />
              <Route path="missing/new" element={<MissingPersonCreatePage />} />
              <Route path="missing/:id" element={<MissingPersonDetailPage />} />
              <Route path="missing/:id/edit" element={<MissingPersonCreatePage />} />

              <Route path="wanted" element={<WantedPersonsListPage />} />
              <Route path="wanted/:id" element={<WantedPersonDetailPage />} />

              <Route path="reports" element={<ReportsListPage />} />
              <Route path="reports/new" element={<ReportCreatePage />} />
              <Route path="reports/:id" element={<ReportDetailPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
