import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import EmailVerificationBanner from '../components/layout/EmailVerificationBanner';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <EmailVerificationBanner />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
