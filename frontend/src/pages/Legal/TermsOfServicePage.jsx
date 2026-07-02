import { Link } from 'react-router-dom'
import LegalPageLayout, { LegalSection } from './LegalPageLayout'

const UPDATED = 'July 2, 2026'

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" updatedDate={UPDATED}>
      <LegalSection title="1. Acceptance of Terms">
        <p>
          By creating an account or using LearnAfrica Lite ("the Platform"), you agree to these Terms
          of Service. If you do not agree, please do not use the Platform.
        </p>
      </LegalSection>

      <LegalSection title="2. Accounts">
        <p>
          You must provide accurate information when registering and are responsible for keeping your
          login credentials secure. You are responsible for all activity that happens under your
          account. Notify us immediately if you suspect unauthorized access.
        </p>
      </LegalSection>

      <LegalSection title="3. Courses, Content, and Instructors">
        <p>
          Course content is created and owned by individual instructors, who are responsible for its
          accuracy and quality. Instructor applications are reviewed before course-creation access is
          granted, but the Platform does not guarantee the outcomes of any course.
        </p>
        <p>
          You may not copy, redistribute, or resell course content without permission from the
          instructor who created it.
        </p>
      </LegalSection>

      <LegalSection title="4. Certificates and Badges">
        <p>
          Certificates and badges are issued automatically based on your activity and performance on
          the Platform (such as completing lessons and passing quizzes). They reflect your activity on
          LearnAfrica Lite and are not accredited by any external education authority unless explicitly
          stated on the course page.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Upload content that is unlawful, harmful, or infringes on someone else's rights</li>
          <li>Attempt to disrupt, probe, or compromise the security of the Platform</li>
          <li>Misrepresent your identity or impersonate another person or organization</li>
          <li>Use the Platform to distribute spam or unauthorized advertising</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Termination">
        <p>
          You may delete your account at any time from Settings. We may suspend or terminate accounts
          that violate these Terms, at our discretion.
        </p>
      </LegalSection>

      <LegalSection title="7. Changes to These Terms">
        <p>
          We may update these Terms from time to time. Continued use of the Platform after a change
          means you accept the updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>
          Questions about these Terms? Reach out via our{' '}
          <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
