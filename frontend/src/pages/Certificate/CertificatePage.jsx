import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Share2, Download, ArrowLeft, Linkedin, Twitter, Facebook, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { api } from '@/lib/apiClient';

/**
 * Single certificate design, used for both the on-screen preview and the
 * printed/PDF output. Print isolation is handled purely with CSS (visibility +
 * fixed positioning of #certificate-content) so the two never drift apart.
 */
export default function CertificatePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [courseDuration, setCourseDuration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setNotFound(false);

    Promise.all([
      api.get(`/api/certificates/course/${courseId}`),
      api.get(`/api/courses/${courseId}`).catch(() => null),
    ])
      .then(([cert, course]) => {
        if (cancelled) return;
        setCertificate(cert);
        setCourseDuration(course?.duration || null);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const formattedDate = certificate
    ? new Date(certificate.issuedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const handleDownload = () => window.print();

  const verifyUrl = certificate
    ? `${window.location.origin}/verify/${certificate.verificationCode}`
    : '';

  const handleShare = async () => {
    const shareData = {
      title: `My ${certificate?.courseTitle} Certificate`,
      text: `I just completed ${certificate?.courseTitle} on LearnAfrica!`,
      url: verifyUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled native share sheet
      }
    } else {
      await navigator.clipboard.writeText(verifyUrl);
      alert('Certificate link copied to clipboard!');
    }
  };

  const openShareWindow = (url) => window.open(url, '_blank', 'noopener,noreferrer');

  const handleShareLinkedIn = () => openShareWindow(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`
  );

  const handleShareTwitter = () => openShareWindow(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `I just completed ${certificate?.courseTitle} on LearnAfrica Lite!`
    )}&url=${encodeURIComponent(verifyUrl)}`
  );

  const handleShareFacebook = () => openShareWindow(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verifyUrl)}`
  );

  if (isLoading) {
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

  if (notFound || !certificate) {
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
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: A4 landscape; margin: 0; }
              body * { visibility: hidden; }
              #certificate-content, #certificate-content * { visibility: visible; }
              #certificate-content {
                position: fixed;
                inset: 0;
                width: 100vw;
                height: 100vh;
                margin: 0;
                border-radius: 0;
                box-shadow: none;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
              }
            }
          `,
        }}
      />

      <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-4 px-3 sm:py-6 sm:px-4 print:bg-white print:p-0">
        <div className="max-w-3xl mx-auto print:max-w-none">
          {/* Top Actions Row */}
          <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5 print:hidden">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
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
                <span className="hidden md:block"> Print / Save PDF</span>
              </Button>
            </div>
          </div>

          {/* Certificate — identical markup renders on screen and on print */}
          <div
            id="certificate-content"
            className="bg-card border border-border/80 rounded-xl shadow-md overflow-hidden print:w-[95%] print:h-[92%] print:border-10 print:border-double print:border-slate-900"
          >
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary print:hidden" />

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
                {certificate.userName}
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                has successfully completed the course
              </p>

              <h3 className="text-sm xs:text-base sm:text-sm md:text-lg font-semibold text-foreground mb-5 sm:mb-6 px-2">
                {certificate.courseTitle}
              </h3>

              <div className={`grid ${courseDuration ? 'grid-cols-3' : 'grid-cols-2'} gap-2 max-w-xl mx-auto mb-6`}>
                <div className="px-1 py-1.5 xs:px-4 xs:py-2 bg-muted/40 rounded-lg border border-border/40 min-w-0">
                  <p className="text-[9px] xs:text-[11px] uppercase tracking-wider text-muted-foreground truncate">
                    Grade
                  </p>
                  <p className="text-xs xs:text-sm font-semibold text-primary mt-0.5 truncate">
                    {certificate.grade}
                  </p>
                </div>

                {courseDuration && (
                  <div className="px-1 py-1.5 xs:px-4 xs:py-2 bg-muted/40 rounded-lg border border-border/40 min-w-0">
                    <p className="text-[9px] xs:text-[11px] uppercase tracking-wider text-muted-foreground truncate">
                      Duration
                    </p>
                    <p className="text-xs xs:text-sm font-semibold text-primary mt-0.5 truncate">
                      {courseDuration}
                    </p>
                  </div>
                )}

                <div className="px-1 py-1.5 xs:px-4 xs:py-2 bg-muted/40 rounded-lg border border-border/40 min-w-0">
                  <p className="text-[9px] xs:text-[11px] uppercase tracking-wider text-muted-foreground truncate">
                    Completed
                  </p>
                  <p className="text-xs xs:text-sm font-medium text-primary mt-0.5 truncate">
                    {formattedDate}
                  </p>
                </div>
              </div>

              <div className="flex flex-row items-center justify-between xs:justify-center gap-2 xs:gap-8 sm:gap-12 pt-5 sm:pt-6 border-t border-border/60">
                <div className="text-center flex-1 xs:flex-initial min-w-0">
                  <div className="font-serif text-xs xs:text-sm sm:text-base md:text-lg italic text-primary/90 mb-0.5 w-full truncate">
                    {certificate.instructorName}
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
                    {certificate.verificationCode}
                  </span>
                </p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground/80 hidden xs:block">
                  Verify credential at: {window.location.host}/verify/{certificate.verificationCode}
                </p>
              </div>
            </div>

            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary print:hidden" />
          </div>

          {/* Social Share Group */}
          <div className="mt-5 sm:mt-6 text-center print:hidden">
            <p className="text-muted-foreground mb-2 sm:mb-3 text-xs">
              Share your achievement
            </p>

            <div className="flex justify-center gap-2.5">
              <button
                onClick={handleShareLinkedIn}
                aria-label="Share on LinkedIn"
                className="p-2 bg-card border border-border/80 rounded-xl hover:bg-muted transition-colors text-foreground/80 group shadow-sm"
              >
                <Linkedin className="w-4 h-4 group-hover:text-[#0A66C2]" />
              </button>
              <button
                onClick={handleShareTwitter}
                aria-label="Share on X"
                className="p-2 bg-card border border-border/80 rounded-xl hover:bg-muted transition-colors text-foreground/80 group shadow-sm"
              >
                <Twitter className="w-4 h-4 group-hover:text-[#1DA1F2]" />
              </button>
              <button
                onClick={handleShareFacebook}
                aria-label="Share on Facebook"
                className="p-2 bg-card border border-border/80 rounded-xl hover:bg-muted transition-colors text-foreground/80 group shadow-sm"
              >
                <Facebook className="w-4 h-4 group-hover:text-[#1877F2]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
