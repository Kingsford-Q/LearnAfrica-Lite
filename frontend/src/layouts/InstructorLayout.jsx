import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Clock, ShieldX, ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

function PendingApprovalGate({ status, reason }) {
  const isRejected = status === 'Rejected';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center space-y-4 border-border/60">
        <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${isRejected ? 'bg-destructive/10' : 'bg-primary/10'}`}>
          {isRejected ? <ShieldX className="h-7 w-7 text-destructive" /> : <Clock className="h-7 w-7 text-primary" />}
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold">
            {isRejected ? 'Application Not Approved' : 'Application Under Review'}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isRejected
              ? (reason || "Your instructor application wasn't approved this time.")
              : "Our team is reviewing your instructor application. You'll get a notification as soon as you're approved to start creating courses."}
          </p>
        </div>
        <Link to="/dashboard" className="block">
          <Button className="w-full"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}

export default function InstructorLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const isStaff = user?.role === 'admin' || user?.role === 'superadmin';
  const isGated = !isStaff && user?.instructorApprovalStatus && user.instructorApprovalStatus !== 'Approved';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {!isGated && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}

        <main className={isGated ? 'flex-1' : 'flex-1 lg:ml-64'}>
          {!isGated && (
            <div className="sticky top-16 z-30 flex items-center gap-4 border-b border-border bg-background px-4 py-3 lg:hidden">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="font-medium text-foreground">Instructor Dashboard</span>
            </div>
          )}

          <div className="p-4 lg:p-8">
            {isGated ? (
              <PendingApprovalGate status={user.instructorApprovalStatus} reason={user.instructorRejectionReason} />
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
