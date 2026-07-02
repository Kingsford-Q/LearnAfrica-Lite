import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input, Label } from '@/components/common/Input'
import { useAuth } from '@/context/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { login, verifyTwoFactorLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [twoFactorToken, setTwoFactorToken] = useState(null)
  const [code, setCode] = useState('')

  const validate = () => {
    const newErrors = {}
    if (!email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email address'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const from = location.state?.from?.pathname || '/courses'
  const resetSuccess = location.state?.resetSuccess

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const result = await login(email, password)
      if (result.requiresTwoFactor) {
        setTwoFactorToken(result.twoFactorToken)
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      setErrors({ submit: err.message || 'Invalid email or password' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (code.length !== 6) {
      setErrors({ submit: 'Enter the 6-digit code from your authenticator app.' })
      return
    }
    setIsLoading(true)
    setErrors({})
    try {
      await verifyTwoFactorLogin(twoFactorToken, code)
      navigate(from, { replace: true })
    } catch (err) {
      setErrors({ submit: err.message || 'Invalid authentication code' })
    } finally {
      setIsLoading(false)
    }
  }

  if (twoFactorToken) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary mb-2">
            <ShieldCheck className="h-6 w-6" />
            <h1 className="text-2xl font-bold text-foreground">Two-factor authentication</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>

        <form onSubmit={handleVerifyCode} className="space-y-4">
          {errors.submit && (
            <div className="p-3 rounded bg-destructive/10 text-destructive text-sm font-medium text-center">
              {errors.submit}
            </div>
          )}
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            placeholder="000000"
            className="text-center text-lg tracking-[0.5em] h-14"
            autoFocus
          />
          <Button type="submit" className="w-full h-11" disabled={isLoading || code.length !== 6}>
            {isLoading ? 'Verifying...' : 'Verify & Sign in'}
          </Button>
        </form>

        <button
          onClick={() => { setTwoFactorToken(null); setCode(''); setErrors({}) }}
          className="flex items-center justify-center w-full text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {resetSuccess && (
          <div className="p-3 rounded bg-green-500/10 text-green-600 dark:text-green-500 text-sm font-medium text-center">
            Password reset successfully. Sign in with your new password.
          </div>
        )}
        {errors.submit && (
          <div className="p-3 rounded bg-destructive/10 text-destructive text-sm font-medium text-center">
            {errors.submit}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="pl-10"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {"Don't have an account?"}{' '}
        <Link to="/signup" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  )
}
