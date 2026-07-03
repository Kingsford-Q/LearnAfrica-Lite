import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import EmailVerificationBanner from '../components/layout/EmailVerificationBanner';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <EmailVerificationBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
