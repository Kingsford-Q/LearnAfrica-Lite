import { Link } from 'react-router-dom'
import { LifeBuoy, ChevronDown, Mail } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

const faqSections = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I enroll in a course?',
        a: 'Browse the course catalog, open a course you like, and click "Enroll". Once enrolled, the course appears on your dashboard where you can track your progress.',
      },
      {
        q: 'Is LearnAfrica Lite free to use?',
        a: 'Some courses are free and some are paid, set individually by each instructor. The price is always shown on the course page before you enroll.',
      },
      {
        q: 'I forgot my password. What do I do?',
        a: 'On the login page, click "Forgot password?" and enter your email. We\'ll send you a link to reset it. If you don\'t see the email, check your spam folder.',
      },
    ],
  },
  {
    category: 'Learning & Progress',
    questions: [
      {
        q: 'How is my course progress calculated?',
        a: 'Progress is based on the lessons you\'ve completed and the quizzes you\'ve passed (a score of 70% or higher) within a course. Your dashboard shows this as a percentage.',
      },
      {
        q: 'Can I retake a quiz?',
        a: 'Yes. Retaking a quiz updates your score for that quiz. If you\'ve already completed and been certified for the course, retaking a quiz won\'t revoke your certificate.',
      },
      {
        q: 'How do certificates and grades work?',
        a: 'Once you complete 100% of a course, a certificate is issued automatically with a grade (Distinction, Merit, Passed, or Completed) based on your quiz performance. You can view and share it from your dashboard, and anyone can verify it using its verification code.',
      },
      {
        q: 'What are badges and how do I earn them?',
        a: 'Badges are awarded automatically for milestones like completing lessons, passing quizzes with a perfect score, finishing courses quickly, and contributing to the community forum. You\'ll get a notification whenever you earn one.',
      },
    ],
  },
  {
    category: 'Instructors',
    questions: [
      {
        q: 'How do I become an instructor?',
        a: 'Sign up and select "I want to teach" during registration, or apply from your account settings. Your application is reviewed by our team before you can publish courses.',
      },
      {
        q: 'Why is my instructor application still pending?',
        a: 'Applications are reviewed by our admin team. You\'ll receive a notification as soon as a decision is made. If it\'s been a while, feel free to contact us.',
      },
      {
        q: 'How do I create a course?',
        a: 'Once approved as an instructor, go to your Instructor Dashboard and click "Create Course". You can build sections, lessons, and quizzes, and save your progress as a draft before publishing.',
      },
    ],
  },
  {
    category: 'Account & Privacy',
    questions: [
      {
        q: 'How do I update my notification preferences?',
        a: 'Go to Settings from your profile menu. You can toggle email, push, and product update notifications there.',
      },
      {
        q: 'How do I delete my account?',
        a: 'In Settings, scroll to the "Danger Zone" section and follow the account deletion steps. This permanently removes your data and cannot be undone.',
      },
    ],
  },
]

export default function HelpCenterPage() {
  return (
    <div className="min-h-[70vh]">
      <div className="px-4 py-16 bg-gradient-to-b from-muted/30 to-background text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <LifeBuoy className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight">Help Center</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Answers to common questions about learning, teaching, and using your account on LearnAfrica Lite.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {faqSections.map((section) => (
          <div key={section.category}>
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">{section.category}</h2>
            <div className="space-y-3">
              {section.questions.map((item) => (
                <details key={item.q} className="group rounded-xl border border-border bg-card overflow-hidden">
                  <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none font-medium text-foreground text-sm sm:text-base">
                    {item.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}

        <Card className="p-6 sm:p-8 text-center">
          <Mail className="h-6 w-6 text-primary mx-auto" />
          <h2 className="mt-3 font-semibold text-foreground">Still need help?</h2>
          <p className="text-sm text-muted-foreground mt-1">Can't find what you're looking for? Reach out and we'll help you directly.</p>
          <Link to="/contact" className="inline-block mt-4">
            <Button>Contact Us</Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
