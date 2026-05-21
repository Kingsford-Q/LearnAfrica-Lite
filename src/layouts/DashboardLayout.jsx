import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
