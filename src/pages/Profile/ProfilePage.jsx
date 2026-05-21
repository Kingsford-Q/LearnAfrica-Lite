import { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, Book, Clock, Trophy, Flame, Globe, MapPin, CheckCircle2, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
  });

  // Sync form data whenever the global user object changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        // Look inside user.profile if it exists, otherwise fall back to top-level
        bio: user.profile?.bio || user.bio || '',
        location: user.profile?.location || user.location || '',
        website: user.profile?.website || user.website || '',
      });
    }
  }, [user]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // Construct payload based on role
      const isInstructor = user?.role === 'instructor';
      
      const payload = {
        name: formData.name,
        avatar: previewImage || user?.avatar,
        // If instructor, keep the nested structure
        profile: isInstructor ? {
          ...user.profile, // keep rating, coursesCount, etc.
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
        } : null,
        // Fallback for students who might just have a top-level bio
        ...( !isInstructor && { 
          bio: formData.bio, 
          location: formData.location 
        }),
        updatedAt: new Date().toISOString()
      };

      await updateUser(payload); 
      setIsEditing(false);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-6 md:space-y-8 animate-in fade-in duration-500">
      
      {/* STATS BAR */}
      {/* STATS BAR - UPDATED FOR DYNAMIC DATA */}
      {/* STATS BAR - MAPPED TO AUTHCONTEXT RESOLVER */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {[
          { 
            label: 'Courses Completed', 
            // Matches 'coursesCompletedCount' from getLiveStats()
            value: user?.stats?.coursesCompletedCount || 0, 
            icon: Book, 
            theme: 'text-primary bg-primary/10' 
          },
          { 
            label: 'Lessons Done', 
            // Matches 'lessonsCompletedCount' from getLiveStats()
            value: user?.stats?.lessonsCompletedCount || 0, 
            icon: Clock, 
            theme: 'text-foreground bg-muted' 
          },
          { 
            label: 'Perfect Quizzes', 
            // Matches 'perfectQuizzes' from getLiveStats()
            value: user?.stats?.perfectQuizzes || 0, 
            icon: Trophy, 
            theme: 'text-accent-foreground bg-accent' 
          },
          { 
            label: 'Current Streak', 
            // Matches 'streak' from getLiveStats()
            value: `${user?.stats?.streak || 1}d`, 
            icon: Flame, 
            theme: 'text-orange-500 bg-orange-500/10' 
          },
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm">
            <div className={cn("p-2.5 md:p-3 rounded-xl", stat.theme)}>
              <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg md:text-xl font-bold tracking-tight text-foreground truncate">
                {stat.value}
              </p>
              <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight truncate">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </section>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* ASIDE: IDENTITY CARD */}
        <aside className="w-full lg:w-1/3 flex">
          <Card className="w-full bg-card border-border flex flex-col shadow-sm overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardContent className="p-8 flex flex-col items-center justify-center flex-grow text-center">
              
              <div className="relative mb-6">
                <div 
                  onClick={() => isEditing && fileInputRef.current?.click()}
                  className={cn(
                    "w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-primary to-accent transition-all duration-300",
                    isEditing && "cursor-pointer ring-4 ring-primary/20 scale-105"
                  )}
                >
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                    {previewImage || user?.avatar ? (
                      <img src={previewImage || user.avatar} alt="User" loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-bold text-primary">{user?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg border-2 border-background hover:scale-110 transition-transform"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground break-words">
                  {user?.name || 'User'}
                </h2>
                <p className="text-xs font-bold text-primary uppercase tracking-widest px-5 py-2 bg-primary/10 rounded-full inline-block border border-primary/20">
                  {user?.role || 'Student'}
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* MAIN: FORM SECTION */}
        <main className="flex-1 flex">
          <Card className="w-full bg-card border-border flex flex-col shadow-sm">
            <CardHeader className="py-5 px-6 md:px-8 border-b border-border flex flex-row items-center justify-between bg-primary/[0.01]">
              <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary">Personal Details</CardTitle>
              {!isEditing && (
                <button 
                  type="button"
                  onClick={() => setIsEditing(true)} 
                  className="bg-primary text-primary-foreground text-[10px] md:text-[11px] font-bold uppercase tracking-widest px-4 md:px-6 h-9 md:h-10 rounded-lg shadow-md shadow-primary/20"
                >
                  Edit Profile
                </button>
              )}
            </CardHeader>
            <CardContent className="p-6 md:p-8 flex-grow">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={cn(
                        "h-11 transition-all duration-300 rounded-xl",
                        !isEditing ? "bg-muted/40 border-transparent text-muted-foreground" : "bg-background border-primary/40 focus:ring-primary/20"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input
                        value={formData.email}
                        readOnly
                        disabled
                        className="h-11 pl-10 bg-muted/60 border-transparent text-muted-foreground/70 cursor-not-allowed rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Professional Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all outline-none text-sm leading-relaxed",
                      isEditing 
                        ? "bg-background border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-inner" 
                        : "bg-muted/40 border-transparent text-muted-foreground resize-none"
                    )}
                    placeholder="Briefly describe your background..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Location</label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={cn(
                          "w-full h-11 pl-10 pr-4 rounded-xl border border-input text-sm transition-all outline-none",
                          isEditing ? "bg-background border-primary/40 focus:ring-2 focus:ring-primary/20" : "bg-muted/40 border-transparent text-muted-foreground"
                        )}
                        placeholder="e.g., Tarkwa, Ghana"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Portfolio/Website</label>
                    <div className="relative group">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                      <input
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={cn(
                          "w-full h-11 pl-10 pr-4 rounded-xl border border-input text-sm transition-all outline-none",
                          isEditing ? "bg-background border-primary/40 focus:ring-2 focus:ring-primary/20" : "bg-muted/40 border-transparent text-muted-foreground"
                        )}
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 pt-6 border-t border-border animate-in slide-in-from-bottom-2">
                    <Button 
                      type="submit" 
                      isLoading={isSaving} 
                      className="w-full sm:flex-1 bg-primary text-primary-foreground h-11 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)} 
                      className="w-full sm:flex-1 h-11 rounded-xl text-xs font-bold uppercase tracking-widest"
                    >
                      Discard
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}