import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, ArrowLeft, KeyRound } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Label } from '@/components/common/Input'
import { api, ApiError } from '@/lib/apiClient'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  if (!email || !token) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Invalid reset link</h1>
          <p className="text-muted-foreground text-sm">
            This password reset link is missing or malformed. Request a new one below.
          </p>
        </div>
        <Link to="/forgot-password">
          <Button className="w-full h-11">Request a new link</Button>
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      await api.post('/api/auth/reset-password', { email, token, newPassword })
      navigate('/login', { state: { resetSuccess: true } })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'This reset link is invalid or has expired.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary mb-2">
          <KeyRound className="h-6 w-6" />
          <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Choose a new password for <span className="font-semibold text-foreground">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2 flex flex-col gap-1">
          <Label htmlFor="newPassword">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-background border-input focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2 flex flex-col gap-1">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-background border-input focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>

      <Link
        to="/login"
        className="flex items-center justify-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  )
}
