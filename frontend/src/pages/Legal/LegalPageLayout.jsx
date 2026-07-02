import { Scale } from 'lucide-react'

export default function LegalPageLayout({ title, updatedDate, children }) {
  return (
    <div className="min-h-[70vh] px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Scale className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {updatedDate}</p>
        </div>

        <div className="prose-legal space-y-8 text-sm sm:text-[15px] leading-relaxed text-foreground/90">
          {children}
        </div>
      </div>
    </div>
  )
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
      <div className="space-y-3 text-muted-foreground">{children}</div>
    </section>
  )
}
