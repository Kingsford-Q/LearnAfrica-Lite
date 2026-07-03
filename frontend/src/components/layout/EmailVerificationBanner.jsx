import { useState } from 'react';
import { Mail, Loader2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/apiClient';

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.emailConfirmed !== false || dismissed) return null;

  const handleResend = async () => {
    setIsSending(true);
    try {
      await api.post('/api/auth/resend-verification');
      setSent(true);
    } catch {
      // best effort
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-700 dark:text-amber-400 font-medium">
          <Mail className="h-4 w-4 shrink-0" />
          {sent ? 'Verification email sent — check your inbox.' : 'Please verify your email address.'}
        </div>
        {!sent && (
          <button
            onClick={handleResend}
            disabled={isSending}
            className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 underline underline-offset-2 hover:no-underline disabled:opacity-50 flex items-center gap-1"
          >
            {isSending && <Loader2 className="h-3 w-3 animate-spin" />}
            Resend email
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="text-amber-700/60 dark:text-amber-400/60 hover:text-amber-700 dark:hover:text-amber-400"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
