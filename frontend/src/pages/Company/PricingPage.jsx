import { Link } from 'react-router-dom'
import { Tag, Gift, ExternalLink, GraduationCap } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

const items = [
  {
    icon: Gift,
    title: 'Free Courses',
    description: 'Instructors can publish courses at no cost. Enroll instantly with one click, no payment step at all.',
  },
  {
    icon: Tag,
    title: 'Paid Courses',
    description: 'Instructors set their own price and provide a checkout link (Gumroad, Paystack, Stripe, or similar). You\'re taken to that link to pay, then return to start learning.',
  },
  {
    icon: ExternalLink,
    title: 'No Platform Fees, No Middleman',
    description: 'LearnAfrica Lite doesn\'t process payments or take a cut. Instructors keep 100% of what they charge through their own payment link.',
  },
  {
    icon: GraduationCap,
    title: 'Become an Instructor for Free',
    description: 'There\'s no cost to apply as an instructor or to publish courses. Your application just needs approval from our team first.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-[70vh]">
      <div className="px-4 py-16 bg-gradient-to-b from-muted/30 to-background text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Tag className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          There's no subscription and no platform fee. Each course is priced individually by the instructor
          who created it, and payment (when a course isn't free) happens directly with them.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <Card key={item.title} className="p-6 flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 sm:p-8 text-center">
          <h2 className="text-xl font-bold text-foreground">Ready to start?</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Browse free and paid courses, or apply to become an instructor and set your own price.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/courses" className="w-full sm:w-auto">
              <Button className="w-full">Browse Courses</Button>
            </Link>
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">Become an Instructor</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
