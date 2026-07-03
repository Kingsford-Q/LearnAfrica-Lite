import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MailCheck, XCircle, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { api, ApiError } from '@/lib/apiClient'
import { useAuth } from '@/context/AuthContext'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''
  const { refreshUser } = useAuth()

  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!email || !token) {
      setStatus('error')
      setMessage('This verification link is missing information. Please request a new one.')
      return
    }

    api.post('/api/auth/verify-email', { email, token })
      .then(() => {
        setStatus('success')
        refreshUser?.()
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err instanceof ApiError ? err.message : 'This verification link is invalid or has expired.')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, token])

  if (status === 'verifying') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground text-sm">Verifying your email...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary mb-2">
            <MailCheck className="h-6 w-6" />
            <h1 className="text-2xl font-bold text-foreground">Email verified</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            <span className="font-semibold text-foreground">{email}</span> is now verified. You're all set.
          </p>
        </div>
        <Link to="/dashboard">
          <Button className="w-full h-11">Go to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-destructive mb-2">
          <XCircle className="h-6 w-6" />
          <h1 className="text-2xl font-bold text-foreground">Verification failed</h1>
        </div>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
      <Link
        to="/dashboard"
        className="flex items-center justify-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to dashboard
      </Link>
    </div>
  )
}
