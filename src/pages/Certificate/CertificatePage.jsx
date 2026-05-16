import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Share2, Download, ArrowLeft, Linkedin, Twitter, Facebook, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';

/**
 * PRINT-ONLY COMPONENT
 * Completely isolated from normal screen layout via native print-canvas classes.
 */
const PrintableCertificate = ({ data, user }) => (
  <div className="isolated-print-canvas">
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* Ensure it is completely removed from standard screens */
          .isolated-print-canvas {
            display: none !important;
          }

          @media print {
            @page {
              size: A4 landscape;
              margin: 0 !important;
            }

            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: 100% !important;
              overflow: hidden !important;
              background-color: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Unhide and lock down full-screen bounds specifically for mobile Safari */
            .isolated-print-canvas {
              display: block !important;
              position: fixed !important;
              inset: 0 !important;
              z-index: 99999 !important;
              width: 100vw !important;
              height: 100vh !important;
              overflow: hidden !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
          }
        `,
      }}
    />

    {/* Print Safe Area */}
    <div className="box-border flex h-screen w-screen items-center justify-center p-6 bg-white text-black">
      {/* Certificate Frame */}
      <div className="relative flex h-[95%] w-[98%] flex-col overflow-hidden rounded-sm border-[14px] border-double border-slate-900 bg-white px-10 py-8 text-center shadow-none">
        
        {/* Decorative Corner Accents */}
        <div className="absolute inset-6 border border-slate-200 pointer-events-none" />
        <div className="absolute left-8 top-8 h-12 w-12 border-l-4 border-t-4 border-primary/60" />
        <div className="absolute right-8 top-8 h-12 w-12 border-r-4 border-t-4 border-primary/60" />
        <div className="absolute bottom-8 left-8 h-12 w-12 border-b-4 border-l-4 border-primary/60" />
        <div className="absolute bottom-8 right-8 h-12 w-12 border-b-4 border-r-4 border-primary/60" />

        {/* Header */}
        <div className="relative z-10 flex flex-col items-center pt-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            LearnAfrica Lite
          </p>

          <h1 className="font-serif text-4xl font-semibold uppercase tracking-[0.15em] text-slate-900">
            Certificate of Completion
          </h1>

          <div className="mt-4 h-px w-48 bg-gradient-to-r from-transparent via-slate-400 to-transparent" />

          <p className="mt-4 text-base italic text-slate-600">
            Awarded in recognition of outstanding course completion
          </p>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-10">
          <p className="text-base text-slate-700">This certifies that</p>

          <h2 className="my-4 inline-block border-b-2 border-slate-900 px-12 pb-1 font-serif text-3xl font-semibold leading-tight text-slate-900">
            {user?.name || 'Authorized Learner'}
          </h2>

          <p className="text-base text-slate-700">
            has successfully completed all course requirements for
          </p>

          <h3 className="mt-3 max-w-4xl font-serif text-2xl font-semibold leading-tight text-primary">
            {data.courseName}
          </h3>

          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-slate-500">
            This certificate acknowledges the recipient’s dedication, consistent
            effort, and demonstrated mastery of the course material.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-4">
          <div className="flex w-full items-end justify-between gap-10 px-8">
            {/* Instructor Signature */}
            <div className="flex flex-1 flex-col items-center">
              <p className="w-56 border-b border-slate-900 pb-1 font-serif text-lg italic text-slate-900">
                {data.instructorName}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                Course Instructor
              </p>
            </div>

            {/* Official Seal */}
            <div className="mx-6 flex shrink-0 flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary text-primary bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="text-center text-[7px] font-semibold uppercase leading-tight tracking-wide">
                  LearnAfrica
                  <br/>
                  Lite
                  <br />
                  Official
                  <br />
                  Seal
                </div>
              </div>
            </div>

            {/* Date Issued */}
            <div className="flex flex-1 flex-col items-center">
              <p className="w-56 border-b border-slate-900 pb-1 text-lg font-medium text-slate-900">
                {data.completionDate}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                Date Issued
              </p>
            </div>
          </div>

          {/* Certificate ID */}
          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-slate-500">
              Certificate ID: {data.certificateId} • Verify at
              LEARNAFRICA.COM/VERIFY
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function CertificatePage() {
  const { courseId } = useParams();
  const { user, courses, certificates, instructors } = useAuth();
  
  const [hydratedCertificate, setHydratedCertificate] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [formattedDate, setFormattedDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setFormattedDate(
      new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }, []);

  useEffect(() => {
    if (!courseId || !courses || !certificates || !formattedDate) return;

    const certificateMeta = certificates[courseId];
    const courseMeta = courses.find((c) => c.id === courseId);
    const instructorMeta = instructors?.find((inst) => inst.id === courseMeta?.instructorId);

    if (certificateMeta && courseMeta && user) {
      setHydratedCertificate({
        courseName: courseMeta.title,
        completionDate: formattedDate,
        instructorName: instructorMeta?.name || 'Lead Instructor',
        certificateId: certificateMeta.id,
        grade: certificateMeta.grade || 'Passed',
        hoursCompleted: courseMeta.duration || 'Completed',
      });
    } else {
      setHydratedCertificate(null);
    }
    setIsProcessing(false);
  }, [courseId, user, courses, certificates, instructors, formattedDate]);

  const handleDownload = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: `My ${hydratedCertificate?.courseName} Certificate`,
      text: `I just completed ${hydratedCertificate?.courseName} on LearnAfrica!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled navigation natively
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Certificate link copied to clipboard!');
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-xs text-muted-foreground">
            Preparing your certificate...
          </p>
        </div>
      </div>
    );
  }

  if (!hydratedCertificate) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-5">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We couldn't verify a valid course completion record for this certificate credential.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild size="sm">
              <Link to="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen print:min-h-0 print:bg-white print:h-auto">
      {/* Screen UI View Layer */}
      <div className="block print:hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-4 px-3 sm:py-6 sm:px-4">
        <div className="max-w-3xl mx-auto">
          {/* Top Actions Row */}
          <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
            <Button
              onClick = {() => navigate(-1)}
              variant = "outline"
              className="flex items-center hover:bg-transparent gap-1.5 text-muted-foreground hover:text-muted-foreground border-none bg-transparent transition-colors text-xs font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:block">Back to Results Page</span>
              <span className="md:hidden block">Back</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="rounded-lg text-xs h-8 px-2.5 sm:px-3"
              >
                <Share2 className="w-3.5 h-3.5 md:mr-1" />
                <span className="hidden md:block">Share</span>
              </Button>

              <Button
                size="sm"
                onClick={handleDownload}
                className="rounded-lg shadow-sm text-xs h-8 px-2.5 sm:px-3"
              >
                <Download className="w-3.5 h-3.5 md:mr-1" />
                <span className="hidden md:block"> Download PDF</span>
              </Button>
            </div>
          </div>

          {/* Certificate Preview Card */}
          <div
            id="certificate-content"
            className="bg-card border border-border/80 rounded-xl shadow-md overflow-hidden"
          >
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />

            <div className="p-4 xs:p-6 md:p-10 text-center">
              <div className="mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/10 mb-2 sm:mb-3">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                    />
                  </svg>
                </div>

                <h1 className="text-xl xs:text-2xl md:text-3xl font-serif font-semibold text-foreground tracking-wide">
                  Certificate of Completion
                </h1>

                <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                  LearnAfrica Lite
                </p>

                <div className="flex items-center gap-3 justify-center mt-3 sm:mt-4">
                  <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-primary/40" />
                  <svg
                    className="w-3.5 h-3.5 text-primary/80"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-primary/40" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                This certifies that
              </p>

              <h2 className="text-lg xs:text-xl md:text-2xl font-serif font-semibold text-primary mb-4 sm:mb-5 border-b border-primary/20 pb-1.5 inline-block px-4 sm:px-6">
                {user?.name || 'Authorized Learner'}
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                has successfully completed the course
              </p>

              <h3 className="text-sm xs:text-base sm:text-sm md:text-lg font-semibold text-foreground mb-5 sm:mb-6 px-2">
                {hydratedCertificate.courseName}
              </h3>

              <div className="grid grid-cols-3 gap-2 max-w-xl mx-auto mb-6">
                <div className="px-1 py-1.5 xs:px-4 xs:py-2 bg-muted/40 rounded-lg border border-border/40 min-w-0">
                  <p className="text-[9px] xs:text-[11px] uppercase tracking-wider text-muted-foreground truncate">
                    Grade
                  </p>
                  <p className="text-xs xs:text-sm font-semibold text-primary mt-0.5 truncate">
                    {hydratedCertificate.grade}
                  </p>
                </div>

                <div className="px-1 py-1.5 xs:px-4 xs:py-2 bg-muted/40 rounded-lg border border-border/40 min-w-0">
                  <p className="text-[9px] xs:text-[11px] uppercase tracking-wider text-muted-foreground truncate">
                    Hours
                  </p>
                  <p className="text-xs xs:text-sm font-semibold text-primary mt-0.5 truncate">
                    {hydratedCertificate.hoursCompleted}
                  </p>
                </div>

                <div className="px-1 py-1.5 xs:px-4 xs:py-2 bg-muted/40 rounded-lg border border-border/40 min-w-0">
                  <p className="text-[9px] xs:text-[11px] uppercase tracking-wider text-muted-foreground truncate">
                    Completed
                  </p>
                  <p className="text-xs xs:text-sm font-medium text-primary mt-0.5 truncate">
                    {hydratedCertificate.completionDate.split(',')[0]}
                  </p>
                </div>
              </div>

              <div className="flex flex-row items-center justify-between xs:justify-center gap-2 xs:gap-8 sm:gap-12 pt-5 sm:pt-6 border-t border-border/60">
                <div className="text-center flex-1 xs:flex-initial min-w-0">
                  <div className="font-serif text-xs xs:text-sm sm:text-base md:text-lg italic text-primary/90 mb-0.5 w-full truncate">
                    {hydratedCertificate.instructorName}
                  </div>
                  <div className="h-px w-16 xs:w-24 sm:w-32 bg-border mx-auto mb-1" />
                  <p className="text-[9px] xs:text-[11px] text-muted-foreground uppercase tracking-tight">
                    Instructor
                  </p>
                </div>

                <div className="flex shrink-0 items-center justify-center w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs font-semibold text-primary leading-none">LAF</div>
                    <div className="text-[6px] xs:text-[7px] uppercase font-medium tracking-wide text-muted-foreground scale-90 mt-0.5">
                      Seal
                    </div>
                  </div>
                </div>

                <div className="text-center flex-1 xs:flex-initial min-w-0">
                  <div className="font-serif text-xs xs:text-sm sm:text-base md:text-lg italic text-primary/90 mb-0.5 w-full truncate">
                    LearnAfrica Team
                  </div>
                  <div className="h-px w-16 xs:w-24 sm:w-32 bg-border mx-auto mb-1" />
                  <p className="text-[9px] xs:text-[11px] text-muted-foreground uppercase tracking-tight">
                    Director
                  </p>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-border/60 text-center space-y-0.5">
                <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                  Certificate ID:{' '}
                  <span className="font-mono font-medium text-foreground/90">
                    {hydratedCertificate.certificateId}
                  </span>
                </p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground/80 hidden xs:block">
                  Verify credential at: learnafrica.com/verify/{hydratedCertificate.certificateId}
                </p>
              </div>
            </div>

            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
          </div>

          {/* Social Share Group */}
          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-muted-foreground mb-2 sm:mb-3 text-xs">
              Share your achievement
            </p>

            <div className="flex justify-center gap-2.5">
              <Link to="#" className="p-2 bg-card border border-border/80 rounded-xl hover:bg-muted transition-colors text-foreground/80 group shadow-sm">
                <Linkedin className="w-4 h-4 group-hover:text-[#0A66C2]" />
              </Link>
              <Link to="#" className="p-2 bg-card border border-border/80 rounded-xl hover:bg-muted transition-colors text-foreground/80 group shadow-sm">
                <Twitter className="w-4 h-4 group-hover:text-[#1DA1F2]" />
              </Link>
              <Link to="#" className="p-2 bg-card border border-border/80 rounded-xl hover:bg-muted transition-colors text-foreground/80 group shadow-sm">
                <Facebook className="w-4 h-4 group-hover:text-[#1877F2]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pure CSS Managed Print Node - Always flatly available in DOM */}
      <PrintableCertificate data={hydratedCertificate} user={user} />
    </div>
  );
}