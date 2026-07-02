import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Sparkles, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'

export default function ComingSoonPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const feature = searchParams.get('feature') || 'This page'

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-muted/30 to-background">
      <Card className="w-full max-w-lg text-center p-8 sm:p-12">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight">{feature} is coming soon</h1>
        <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
          We're still building this out. Check back later, or head back to where you were.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={handleBack} className="w-full sm:w-auto gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
