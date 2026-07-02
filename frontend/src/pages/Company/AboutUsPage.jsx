import { Link } from 'react-router-dom'
import { GraduationCap, Globe2, Heart, Target, Users } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

const values = [
  {
    icon: Globe2,
    title: 'Access for Everyone',
    description: 'Quality education shouldn\'t depend on where you\'re born. We build for learners across Africa, on any connection, on any device.',
  },
  {
    icon: Target,
    title: 'Practical Skills',
    description: 'Courses are built around real outcomes: lessons, quizzes, and certificates that actually reflect what you\'ve learned.',
  },
  {
    icon: Users,
    title: 'Instructors Who Know the Ground',
    description: 'Our instructors are reviewed and approved so learners can trust the people teaching them.',
  },
  {
    icon: Heart,
    title: 'Built With Care',
    description: 'We sweat the details, from course creation tools to progress tracking, because a good learning experience is made of small things done well.',
  },
]

export default function AboutUsPage() {
  return (
    <div className="min-h-[70vh]">
      <div className="px-4 py-16 bg-gradient-to-b from-muted/30 to-background text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight">About LearnAfrica Lite</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          LearnAfrica Lite is an online learning platform built to make quality education accessible,
          practical, and rewarding for learners across Africa, and to give instructors a simple way
          to share what they know.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {values.map((value) => (
            <Card key={value.title} className="p-6 flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <value.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{value.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{value.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 sm:p-8 text-center">
          <h2 className="text-xl font-bold text-foreground">Want to learn or teach with us?</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Browse our course catalog, or apply to become an instructor and start building your own courses.
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
