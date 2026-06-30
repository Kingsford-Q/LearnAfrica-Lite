import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Loader2, Save, AlertTriangle, CheckCircle2, XCircle, Bell, Shield, Palette, GraduationCap, Trash2, X } from 'lucide-react';

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
  const { isInstructorMode, user, updateUser} = useAuth();
  
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

  useEffect(() => {
    if (user?.settings) {
      // Hydrating local state from the persistent user object
      setSettings({
        notifications: user.settings.notifications || { email: true, push: false, updates: true },
        privacy: user.settings.privacy || { twoFactor: false },
        instructor: user.settings.instructor || { payout: true, messages: true }
      });
      
      // We reset hasChanges to false because these values 
      // are now identical to what's in the database/context.
      setHasChanges(false); 
    }
  }, [user]);

  const saveSettings = async () => {
    setIsSaving(true);
    // Clear previous status before starting
    setStatus({ type: null, message: '' });

    try {
      
      await updateUser({
        ...user,
        settings: {
          ...settings,
          // Syncing the theme preference here ensures it persists across logins
          appearance: theme 
        }
      });

      setStatus({ 
        type: 'success', 
        message: 'Settings updated and saved successfully!' 
      });
      
      // Reset the "Save Changes" button state
      setHasChanges(false);
    } catch (error) {
      console.error("Settings Save Error:", error);
      setStatus({ 
        type: 'error', 
        message: 'Failed to sync settings. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Personalize your experience as a {isInstructorMode ? 'Instructor' : 'Student'}.
          </p>
        </div>
        
        {hasChanges && (
          <Button onClick={saveSettings} disabled={isSaving} className="w-full sm:w-auto shadow-sm">
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
              <CardTitle className = "text-lg">Appearance</CardTitle>
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
                <CardTitle className = "text-lg">Instructor Preferences</CardTitle>
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
              <CardTitle className = "text-lg">Notifications</CardTitle>
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
        {/* Security Section */}
{/* Security Section */}
{/* Security Section */}
{/* Security Section */}
<Card className="border-border/60 overflow-hidden bg-card">
  {/* 
      1. Hide the parent header ONLY on mobile when the form is open. 
      This prevents the "double-layered" look in image_1ef0ad.png.
  */}
  <CardHeader className={`${showPasswordForm ? 'hidden sm:block' : 'block'} border-b border-border/40`}>
    <div className="flex items-center gap-2">
      <Shield className="h-5 w-5 text-primary" />
      <CardTitle className="text-lg">Privacy & Security</CardTitle>
    </div>
  </CardHeader>
  
  {/* 
      2. The Fix: We use p-0 (all sides) on mobile when the form is open. 
      This ensures the internal component is perfectly flush with the Card borders.
  */}
  <CardContent className={`w-full transition-all duration-300 ${showPasswordForm ? 'p-0 sm:p-6' : 'p-6'}`}>
    {!showPasswordForm ? (
      <div className="flex md:flex-row flex-col md:items-start md:justify-between gap-5 animate-in fade-in duration-300">
        <div className="space-y-1">
          <p className="text-sm font-medium">Account Password</p>
          <p className="text-sm text-muted-foreground">Change your password to keep your account secure</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowPasswordForm(true)}
        >
          Update Password
        </Button>
      </div>
    ) : (
      <div className="w-full animate-in slide-in-from-top-2 duration-300">
        {/* 
            3
        */}
        <UpdatePasswordSection 
          onCancel={() => setShowPasswordForm(false)} 
          onSuccess={(message) => {
            setShowPasswordForm(false);
            setStatus({ type: 'success', message: message });
          }}
        />
      </div>
    )}
  </CardContent>
</Card>

        {/* Danger Zone */}
        <div className="pt-6 mt-6 border-t border-destructive/20 w-full overflow-hidden"> {/* Ensure wrapper is clean */}
          {!showDeleteVerification ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl bg-destructive/5 border border-destructive/10 gap-6">
              <div className="space-y-1">
                <h3 className="text-md md:text-lg font-bold text-destructive flex items-center gap-2">
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
          ) : (
            <div className="w-full max-w-full overflow-hidden animate-in zoom-in-95 duration-200">
              <DeleteAccountSection 
                userEmail={user?.email || "user@example.com"} 
                onCancel={() => setShowDeleteVerification(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}