import { Link } from 'react-router-dom'
import LegalPageLayout, { LegalSection } from './LegalPageLayout'

const UPDATED = 'July 2, 2026'

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" updatedDate={UPDATED}>
      <LegalSection title="1. What We Use Cookies For">
        <p>
          LearnAfrica Lite uses a single essential cookie to keep you signed in: a secure, HTTP-only
          refresh-token cookie that lets your session continue across visits without you having to log
          in every time.
        </p>
      </LegalSection>

      <LegalSection title="2. Why This Cookie Is Essential">
        <p>
          This cookie is strictly necessary for the Platform to function. Without it, your account
          session couldn't persist between page loads. Because it's essential, it isn't part of an
          optional tracking or advertising consent choice.
        </p>
      </LegalSection>

      <LegalSection title="3. What We Don't Use">
        <p>
          We do not use third-party advertising cookies, cross-site tracking pixels, or analytics
          cookies that build a profile of you across other websites.
        </p>
      </LegalSection>

      <LegalSection title="4. Managing Cookies">
        <p>
          You can clear cookies at any time through your browser settings. Doing so will sign you out
          of LearnAfrica Lite, and you'll need to log in again.
        </p>
      </LegalSection>

      <LegalSection title="5. Contact">
        <p>
          Questions about our cookie use? Reach out via our{' '}
          <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
