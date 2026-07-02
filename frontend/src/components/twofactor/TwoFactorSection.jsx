import { useState } from 'react';
import { Button } from '../common/Button';
import { Loader2, ShieldCheck, ShieldOff, X, Copy, Check } from 'lucide-react';
import { api, ApiError } from '../../lib/apiClient';

export default function TwoFactorSection({ isEnabled, onCancel, onChanged }) {
  const [step, setStep] = useState('start'); // start | setup | disable
  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const beginSetup = async () => {
    setIsBusy(true);
    setError('');
    try {
      const data = await api.post('/api/users/me/2fa/setup');
      setSetupData(data);
      setStep('setup');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start setup.');
    } finally {
      setIsBusy(false);
    }
  };

  const confirmSetup = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setError('');
    try {
      await api.post('/api/users/me/2fa/verify', { code });
      onChanged?.('Two-factor authentication is now enabled.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid code. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const confirmDisable = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setError('');
    try {
      await api.post('/api/users/me/2fa/disable', { code });
      onChanged?.('Two-factor authentication has been disabled.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid code. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const copySecret = async () => {
    if (!setupData?.secret) return;
    try {
      await navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — the secret is still shown as selectable text.
    }
  };

  return (
    <div className="mt-0 md:mt-4 p-6 rounded-2xl bg-background border border-border/50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-xl">
            <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">
              {isEnabled ? 'Disable Two-Factor Authentication' : 'Set Up Two-Factor Authentication'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isEnabled ? 'Enter a code from your authenticator app to turn this off.' : 'Add an extra layer of security to your account.'}
            </p>
          </div>
        </div>
        <button onClick={onCancel} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && <p className="text-xs text-destructive font-medium mb-4">{error}</p>}

      {isEnabled ? (
        <form onSubmit={confirmDisable} className="space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            placeholder="000000"
            className="w-full text-center text-lg tracking-[0.5em] py-3 rounded-xl border border-border bg-muted/5 outline-none focus:ring-1 focus:ring-destructive/40"
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <Button type="submit" variant="destructive" disabled={isBusy || code.length !== 6} className="gap-2">
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
              Disable
            </Button>
          </div>
        </form>
      ) : step === 'start' ? (
        <Button onClick={beginSetup} disabled={isBusy} className="gap-2">
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Start Setup
        </Button>
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Add this key manually in your authenticator app (Google Authenticator, Authy, 1Password, etc):
            </p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border">
              <code className="flex-1 text-sm font-mono break-all">{setupData.secret}</code>
              <button type="button" onClick={copySecret} className="shrink-0 p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <form onSubmit={confirmSetup} className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground">Enter the 6-digit code it generates</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              placeholder="000000"
              className="w-full text-center text-lg tracking-[0.5em] py-3 rounded-xl border border-border bg-muted/5 outline-none focus:ring-1 focus:ring-green-500/40"
            />
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <Button type="submit" disabled={isBusy || code.length !== 6} className="gap-2 bg-green-600 hover:bg-green-700">
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Verify & Enable
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
