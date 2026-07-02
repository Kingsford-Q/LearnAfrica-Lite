import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShieldCheck, Search, CheckCircle2, XCircle, Loader2, Award, Calendar, User, BookOpen } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import { api } from '@/lib/apiClient'
import { cn } from '@/lib/utils'

export default function VerifyCredentialPage() {
  const { code: codeParam } = useParams()
  const navigate = useNavigate()
  const [code, setCode] = useState(codeParam || '')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null) // { valid, certificate } | null

  const verify = useCallback(async (value) => {
    if (!value?.trim()) return
    setIsLoading(true)
    setResult(null)
    try {
      const data = await api.get(`/api/certificates/verify/${encodeURIComponent(value.trim())}`)
      setResult(data)
    } catch {
      setResult({ valid: false, certificate: null })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (codeParam) verify(codeParam)
  }, [codeParam, verify])

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(code.trim() ? `/verify/${encodeURIComponent(code.trim())}` : '/verify')
    verify(code)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full max-w-xl text-center space-y-8">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Verify a Credential</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter an official certificate or badge ID below to verify its authenticity.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. LA-CERT-ABCD-1A2B"
            className="h-14 text-center text-base rounded-2xl shadow-sm"
          />
          <Button type="submit" size="lg" disabled={isLoading || !code.trim()} className="w-full sm:w-auto gap-2 px-10 h-12 rounded-xl font-semibold">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Verify Credential
          </Button>
        </form>

        {result && (
          <Card className={cn(
            'text-left p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300 border-2',
            result.valid ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'
          )}>
            {result.valid ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Credential Verified</p>
                    <p className="text-xs text-muted-foreground">This is an authentic LearnAfrica Lite credential.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                  <DetailRow icon={User} label="Issued To" value={result.certificate.userName} />
                  <DetailRow icon={BookOpen} label="Course" value={result.certificate.courseTitle} />
                  <DetailRow icon={Award} label="Grade" value={result.certificate.grade} />
                  <DetailRow icon={Calendar} label="Issued On" value={new Date(result.certificate.issuedAt).toLocaleDateString()} />
                </div>

                <p className="text-[11px] font-mono text-muted-foreground/70 pt-2 border-t border-border/60">
                  Certificate ID: {result.certificate.verificationCode}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Credential Not Found</p>
                  <p className="text-xs text-muted-foreground">We couldn't verify a credential with that ID. Double-check the code and try again.</p>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}
