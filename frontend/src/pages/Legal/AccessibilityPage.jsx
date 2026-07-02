import { Link } from 'react-router-dom'
import LegalPageLayout, { LegalSection } from './LegalPageLayout'

const UPDATED = 'July 2, 2026'

export default function AccessibilityPage() {
  return (
    <LegalPageLayout title="Accessibility Statement" updatedDate={UPDATED}>
      <LegalSection title="Our Commitment">
        <p>
          LearnAfrica Lite aims to be usable by as many learners as possible, regardless of ability or
          the device they're using. We're continuously working to improve accessibility across the
          Platform.
        </p>
      </LegalSection>

      <LegalSection title="What We Do">
        <ul className="list-disc pl-5 space-y-1">
          <li>Support keyboard navigation for interactive elements like menus, toggles, and forms</li>
          <li>Use semantic HTML and ARIA attributes (such as on toggle switches) where appropriate</li>
          <li>Maintain readable color contrast in both light and dark mode</li>
          <li>Design layouts that adapt responsively across phone, tablet, and desktop screens</li>
        </ul>
      </LegalSection>

      <LegalSection title="Ongoing Work">
        <p>
          Accessibility is an ongoing effort, not a one-time fix. If you encounter a barrier while using
          LearnAfrica Lite, such as a page that's hard to navigate with a keyboard, or content that's
          hard to read with a screen reader, we want to know.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Report an accessibility issue via our{' '}
          <Link to="/contact" className="text-primary hover:underline">Contact page</Link>, and we'll
          look into it.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
