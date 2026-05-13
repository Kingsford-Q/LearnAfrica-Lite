import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Globe, MapPin, FileText, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input, Label } from '@/components/common/Input'
import { useAuth } from '@/context/AuthContext'

export default function InstructorOnboarding() {
  const locationState = useLocation().state
  const navigate = useNavigate()
  const { signup } = useAuth()
  
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    website: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Safety Check: Redirect if user accessed page without Step 1 data
  if (!locationState) {
    navigate('/signup')
    return null
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.bio || formData.bio.length < 50) {
      newErrors.bio = 'Please provide a detailed bio (at least 50 characters)'
    }
    if (!formData.location) newErrors.location = 'Location is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    try {
      // Simulate API call - In production, this hits your Node/Express endpoint
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Combine Step 1 (Auth) and Step 2 (Professional) data
      const completeInstructorData = {
        ...locationState, // contains name, email, password
        ...formData,      // contains bio, location, website
        role: 'instructor'
      }

      await signup(completeInstructorData)
      
      // Navigate to the instructor's specific view
      navigate('/instructor')
    } catch (err) {
      setErrors({ submit: 'Failed to create instructor profile. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <button 
          onClick={() => navigate('/signup')} 
          className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="mr-1 h-3 w-3" /> Back to account details
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Professional Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete your instructor profile to start creating courses.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider">
            Professional Bio
          </Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell students about your experience, expertise, and teaching style..."
              className="flex min-h-[140px] w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          {errors.bio && <p className="text-xs text-destructive font-medium">{errors.bio}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider">
            Your Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Accra, Ghana"
              className="pl-10"
            />
          </div>
          {errors.location && <p className="text-xs text-destructive font-medium">{errors.location}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-xs font-bold uppercase tracking-wider">
            Portfolio / Website (Optional)
          </Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://yourportfolio.com"
              className="pl-10"
            />
          </div>
        </div>

        {errors.submit && (
          <div className="p-3 rounded bg-destructive/10 text-destructive text-xs font-bold text-center">
            {errors.submit}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying Profile...
            </>
          ) : (
            'Complete Registration'
          )}
        </Button>
      </form>

      <p className="text-center text-[11px] text-muted-foreground px-4 leading-relaxed italic">
        By completing this registration, you agree to our Instructor Guidelines and Content Quality Standards.
      </p>
    </div>
  )
}