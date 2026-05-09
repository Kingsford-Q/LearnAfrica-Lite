import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export default function CertificatePage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  
  const certificateData = {
    courseName: 'Introduction to JavaScript',
    completionDate: 'May 5, 2026',
    instructorName: 'Dr. Amina Okonkwo',
    certificateId: `LA-JS-${Date.now().toString(36).toUpperCase()}`,
    grade: 'A',
    hoursCompleted: 24,
  };

  const handleDownload = () => {
    alert('Certificate download functionality would be implemented here');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `My ${certificateData.courseName} Certificate`,
        text: `I just completed ${certificateData.courseName} on LearnAfrica!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleShare}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </Button>
            <Button onClick={handleDownload}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </Button>
          </div>
        </div>

        {/* Certificate */}
        <div className="bg-card border-4 border-double border-primary/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Pattern */}
          <div className="h-4 bg-gradient-to-r from-primary via-accent to-primary" />
          
          <div className="p-8 md:p-12 text-center">
            {/* Logo & Title */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
                <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-wide">
                Certificate of Completion
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">LearnAfrica Lite</p>
            </div>

            {/* Decorative Line */}
            <div className="flex items-center gap-4 justify-center mb-8">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary/50" />
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary/50" />
            </div>

            {/* Recipient */}
            <p className="text-lg text-muted-foreground mb-2">This certifies that</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-6 border-b-2 border-primary/30 pb-4 inline-block px-8">
              {user?.name || 'Student Name'}
            </h2>

            {/* Course Details */}
            <p className="text-lg text-muted-foreground mb-2">has successfully completed the course</p>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              {certificateData.courseName}
            </h3>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="px-6 py-3 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground">Grade Achieved</p>
                <p className="text-2xl font-bold text-primary">{certificateData.grade}</p>
              </div>
              <div className="px-6 py-3 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground">Hours Completed</p>
                <p className="text-2xl font-bold text-foreground">{certificateData.hoursCompleted}</p>
              </div>
              <div className="px-6 py-3 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground">Completion Date</p>
                <p className="text-xl font-bold text-foreground">{certificateData.completionDate}</p>
              </div>
            </div>

            {/* Signature */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 pt-8 border-t border-border">
              <div className="text-center">
                <div className="font-serif text-2xl italic text-primary mb-2">
                  {certificateData.instructorName}
                </div>
                <div className="h-px w-40 bg-foreground mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">Course Instructor</p>
              </div>
              <div className="text-center">
                <div className="font-serif text-2xl italic text-primary mb-2">
                  LearnAfrica Team
                </div>
                <div className="h-px w-40 bg-foreground mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">Platform Director</p>
              </div>
            </div>

            {/* Certificate ID */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Certificate ID: <span className="font-mono">{certificateData.certificateId}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Verify at: learnafrica.com/verify/{certificateData.certificateId}
              </p>
            </div>
          </div>

          {/* Footer Pattern */}
          <div className="h-4 bg-gradient-to-r from-primary via-accent to-primary" />
        </div>

        {/* Social Sharing */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">Share your achievement</p>
          <div className="flex justify-center gap-4">
            {['LinkedIn', 'Twitter', 'Facebook'].map((platform) => (
              <button
                key={platform}
                className="px-6 py-2 bg-card border border-border rounded-xl hover:bg-muted transition-colors text-foreground"
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
