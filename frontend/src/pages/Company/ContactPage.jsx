import { Mail, Phone, Clock, MessageCircle } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

const CONTACT_EMAIL = 'kingsfordquainoo48@gmail.com'
const CONTACT_PHONE_DISPLAY = '+233 25 641 1155'
const CONTACT_PHONE_TEL = '+233256411155'

export default function ContactPage() {
  return (
    <div className="min-h-[70vh] px-4 py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Get in Touch</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Have a question, found a bug, or want to partner with us? Reach out directly and we'll get back to you.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mt-12 grid gap-6 sm:grid-cols-2">
        <Card className="p-6 sm:p-8 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Email Us</h2>
            <p className="text-sm text-muted-foreground mt-1 break-all">{CONTACT_EMAIL}</p>
          </div>
          <a href={`mailto:${CONTACT_EMAIL}`} className="w-full">
            <Button className="w-full gap-2">
              <Mail className="h-4 w-4" />
              Send an Email
            </Button>
          </a>
        </Card>

        <Card className="p-6 sm:p-8 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Call Us</h2>
            <p className="text-sm text-muted-foreground mt-1">{CONTACT_PHONE_DISPLAY}</p>
          </div>
          <a href={`tel:${CONTACT_PHONE_TEL}`} className="w-full">
            <Button variant="outline" className="w-full gap-2">
              <Phone className="h-4 w-4" />
              Call Now
            </Button>
          </a>
        </Card>
      </div>

      <div className="max-w-3xl mx-auto mt-8">
        <Card className="p-5 flex items-center gap-3 justify-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          We typically respond within 1-2 business days.
        </Card>
      </div>
    </div>
  )
}
