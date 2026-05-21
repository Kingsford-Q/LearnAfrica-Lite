import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom' 
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Label } from '@/components/common/Input'
import { useAuth } from '@/context/AuthContext' // Added Auth Context

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState(1) 
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false) 
  
  const { login } = useAuth() // Added login function
  const navigate = useNavigate() 
  const inputRefs = useRef([])

  const validateEmail = () => {
    if (!email) {
      setError('Email is required')
      return false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    setError('')
    return true
  }

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleRequestCode = async (e, isResend = false) => {
    if (e) e.preventDefault()
    if (!validateEmail()) return

    if (isResend) setIsResending(true)
    else setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (isResend) setIsResending(false)
    else setIsLoading(false)
    
    setStep(2)
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    const fullCode = otp.join('')
    if (fullCode.length < 6) {
      setError('Please enter all 6 digits')
      return
    }
    setIsLoading(true)
    
    // Simulate API Verification
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Log the user in with a simulated profile based on email
    login({ email, name: email.split('@')[0] }) 
    
    setIsLoading(false)
    navigate('/courses')
  }

  if (step === 2) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary mb-7">
            <ShieldCheck className="h-6 w-6" />
            <h1 className="text-2xl font-bold text-foreground">Verify Email</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            Enter the 6-digit code sent to <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div className="space-y-4">
            <Label className="mt-12">Verification Code</Label>
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center mt-3 text-xl font-bold border-2 rounded-lg bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              ))}
            </div>
            {error && <p className="text-sm text-destructive animate-pulse">{error}</p>}
          </div>

          <Button type="submit" className="w-full h-11" disabled={isLoading || isResending}>
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <button 
            type="button" 
            disabled={isResending}
            onClick={(e) => handleRequestCode(e, true)}
            className="text-sm text-primary hover:underline font-medium disabled:opacity-50"
          >
            {isResending ? 'Sending new code...' : 'Resend Code'}
          </button>
          <button 
            onClick={() => setStep(1)}
            className="flex items-center justify-center w-full text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Forgot password?</h1>
        <p className="text-muted-foreground text-sm ">
          No stress. Enter your email and we'll send a code.
        </p>
      </div>

      <form onSubmit={(e) => handleRequestCode(e, false)} className="space-y-4">
        <div className="space-y-2 flex flex-col gap-1">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-background border-input focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Continue'}
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