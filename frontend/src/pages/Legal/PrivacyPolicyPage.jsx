import { Link } from 'react-router-dom'
import LegalPageLayout, { LegalSection } from './LegalPageLayout'

const UPDATED = 'July 2, 2026'

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updatedDate={UPDATED}>
      <LegalSection title="1. Information We Collect">
        <p>When you use LearnAfrica Lite, we collect:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Account information you provide, such as your name, email address, and password</li>
          <li>Profile details you choose to add, such as a bio, location, website, or avatar</li>
          <li>Activity data, such as courses enrolled in, lesson and quiz progress, reviews, and forum posts</li>
          <li>Technical data needed to keep you signed in, such as session and refresh tokens</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <p>We use your information to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide core functionality, such as course access, progress tracking, certificates, and badges</li>
          <li>Send notifications you've opted into, such as badge achievements or instructor updates</li>
          <li>Maintain the security of your account and the Platform</li>
          <li>Respond to support requests sent through our Contact page</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </LegalSection>

      <LegalSection title="3. Data Storage">
        <p>
          Your data is stored in a managed PostgreSQL database. Uploaded files (such as avatars and
          course thumbnails) are validated before storage to prevent misuse.
        </p>
      </LegalSection>

      <LegalSection title="4. Cookies and Sessions">
        <p>
          We use a secure, HTTP-only cookie to keep you signed in between visits. See our{' '}
          <Link to="/cookies" className="text-primary hover:underline">Cookie Policy</Link> for details.
        </p>
      </LegalSection>

      <LegalSection title="5. Your Rights">
        <p>
          You can view and update your profile and notification preferences at any time from Settings.
          You can permanently delete your account and associated data from the Danger Zone section of
          Settings.
        </p>
      </LegalSection>

      <LegalSection title="6. Third-Party Sharing">
        <p>
          We do not share your personal data with third parties except where required to operate the
          Platform (such as our hosting and database providers) or where required by law.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          Questions about this policy or your data? Reach out via our{' '}
          <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
