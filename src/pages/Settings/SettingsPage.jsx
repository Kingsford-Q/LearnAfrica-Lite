import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Loader2, Save, AlertTriangle, CheckCircle2, XCircle, Bell, Shield, Palette, GraduationCap, Trash2 } from 'lucide-react';

// Import your sub-components
import DeleteAccountSection from '../../components/delete/DeleteAccountSection';
import UpdatePasswordSection from '../../components/updatepassword/UpdatePasswordSection';

/**
 * Reusable Setting Row for consistent UI
 */
const SettingRow = ({ label, desc, children, icon: Icon }) => (
  <div className="flex items-center justify-between py-4 group transition-all">
    <div className="flex items-start gap-3">
      {Icon && <Icon className="h-5 w-5 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors" />}
      <div className="space-y-0.5">
        <p className="text-sm font-medium leading-none text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
    <div className="flex-shrink-0 ml-4">{children}</div>
  </div>
);

/**
 * Clean Switch Toggle
 */
const Switch = ({ checked, onChange, disabled }) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
      checked ? 'bg-primary' : 'bg-input'
    }`}
  >
    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
  </button>
);

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { isInstructorMode, user } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteVerification, setShowDeleteVerification] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false); // New state for password form
  const [status, setStatus] = useState({ type: null, message: '' });
  
  const [settings, setSettings] = useState({
    notifications: { email: true, push: false, updates: true },
    privacy: { twoFactor: false },
    instructor: { payout: true, messages: true }
  });

  const handleToggle = (category, key) => {
    if (status.type) setStatus({ type: null, message: '' });
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: !prev[category][key] }
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus({ type: 'success', message: 'Settings saved successfully!' });
      setHasChanges(false);
    } catch (error) {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground text-lg">
            Personalize your experience as a {isInstructorMode ? 'Instructor' : 'Student'}.
          </p>
        </div>
        
        {hasChanges && (
          <Button onClick={saveSettings} disabled={isSaving} className="w-full sm:w-auto shadow-md">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        )}
      </header>

      {/* Floating Feedback Alert */}
      {status.type && (
        <div className={`mb-6 flex items-center gap-3 p-4 rounded-xl border animate-in slide-in-from-top-2 ${
          status.type === 'success' 
            ? 'bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400' 
            : 'bg-destructive/5 border-destructive/20 text-destructive'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span className="text-sm font-semibold">{status.message}</span>
        </div>
      )}

      <div className="grid gap-8">
        {/* Appearance Section */}
        <Card className="overflow-hidden border-border/60">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <SettingRow 
              label="Dark Mode" 
              desc={`Switch to ${theme === 'dark' ? 'light' : 'dark'} interface`}
            >
              <Switch checked={theme === 'dark'} onChange={toggleTheme} />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Instructor Section */}
        {isInstructorMode && (
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <CardTitle>Instructor Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border/40">
              <SettingRow label="Revenue Alerts" desc="Email notifications for payouts" >
                <Switch checked={settings.instructor.payout} onChange={() => handleToggle('instructor', 'payout')} />
              </SettingRow>
              <SettingRow label="Direct Messages" desc="Allow students to reach out to you" >
                <Switch checked={settings.instructor.messages} onChange={() => handleToggle('instructor', 'messages')} />
              </SettingRow>
            </CardContent>
          </Card>
        )}

        {/* Notifications Section */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-border/40">
            <SettingRow label="Email Communications" desc={user?.email || "Updates to your primary inbox"} >
              <Switch checked={settings.notifications.email} onChange={() => handleToggle('notifications', 'email')} />
            </SettingRow>
            <SettingRow label="Push Notifications" desc="Real-time alerts via browser" >
              <Switch checked={settings.notifications.push} onChange={() => handleToggle('notifications', 'push')} />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Privacy & Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {!showPasswordForm ? (
              <div className="flex items-center justify-between animate-in fade-in duration-300">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Account Password</p>
                  <p className="text-sm text-muted-foreground">Change your password to keep your account secure</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowPasswordForm(true)}
                  className=""
                >
                  Update Password
                </Button>
              </div>
            ) : (
              <UpdatePasswordSection onCancel={() => setShowPasswordForm(false)} />
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {!showDeleteVerification ? (
          <div className="pt-6 mt-6 border-t border-destructive/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl bg-destructive/5 border border-destructive/10 gap-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your LearnAfrica account and all associated data.
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDeleteVerification(true)}
                className="w-full sm:w-auto text-destructive bg-destructive/10 hover:bg-destructive hover:text-white transition-colors shadow-sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </div>
        ) : (
          <DeleteAccountSection 
            userEmail={user?.email || "user@example.com"} 
            onCancel={() => setShowDeleteVerification(false)}
          />
        )}
      </div>
    </div>
  );
}