import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProfile(formData);
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account information and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar Section */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-primary-foreground mx-auto">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-background border border-border rounded-full shadow-lg hover:bg-muted transition-colors">
                <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.role === 'instructor' ? 'Instructor' : 'Student'}</p>
            <div className="mt-4 flex justify-center gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {user?.role === 'instructor' ? '12 Courses' : '8 Enrolled'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-muted disabled:text-muted-foreground transition-all"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g., Lagos, Nigeria"
              />
              <Input
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="https://yourwebsite.com"
              />
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button type="submit" isLoading={isSaving}>
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Learning Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Courses Completed', value: '12', icon: '📚' },
                { label: 'Hours Learned', value: '156', icon: '⏱️' },
                { label: 'Certificates Earned', value: '8', icon: '🏆' },
                { label: 'Current Streak', value: '14 days', icon: '🔥' },
              ].map((stat, index) => (
                <div key={index} className="text-center p-4 bg-muted/50 rounded-xl">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
