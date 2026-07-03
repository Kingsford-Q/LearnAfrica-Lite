import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Share2, Download, ArrowLeft, Linkedin, Twitter, Facebook, AlertCircle, Loader2, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { api } from '@/lib/apiClient';

/**
 * Single certificate design, used for both the on-screen preview and the
 * downloaded file. The download is a real generated PDF (html2canvas + jsPDF,
 * lazy-loaded only when the button is clicked) rather than window.print() --
 * print-to-PDF support is inconsistent across mobile browsers and often
 * unavailable at all inside in-app webviews, whereas a generated file download
 * works the same way everywhere a real browser tab is open.
 */
export default function CertificatePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [courseDuration, setCourseDuration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

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

  const verifyUrl = certificate
    ? `${window.location.origin}/verify/${certificate.verificationCode}`
    : '';

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError('');
    try {
      const node = document.getElementById('certificate-content');
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(node, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`LearnAfrica-Certificate-${certificate.verificationCode}.pdf`);
    } catch (err) {
      console.error('Certificate PDF generation failed, falling back to print:', err);
      setDownloadError("Couldn't generate a PDF directly -- opening print instead, choose \"Save as PDF\" there.");
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

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
    <div className="min-h-screen bg-muted/20">
      <div className="py-4 px-3 sm:py-8 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Top Actions Row */}
          <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
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
                disabled={isDownloading}
                className="rounded-lg shadow-sm text-xs h-8 px-2.5 sm:px-3"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 md:mr-1 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 md:mr-1" />
                )}
                <span className="hidden md:block">{isDownloading ? 'Generating...' : 'Download PDF'}</span>
              </Button>
            </div>
          </div>

          {downloadError && (
            <p className="text-xs text-amber-600 dark:text-amber-500 text-center mb-4 px-2">{downloadError}</p>
          )}

          {/* Certificate */}
          <div
            id="certificate-content"
            className="relative bg-white rounded-2xl shadow-xl overflow-hidden mx-auto"
            style={{ aspectRatio: '1.414 / 1' }}
          >
            {/* Outer frame */}
            <div className="absolute inset-2 xs:inset-3 sm:inset-4 border-2 border-primary/15 rounded-xl pointer-events-none" />
            <div className="absolute inset-3 xs:inset-4 sm:inset-5 border border-primary/10 rounded-lg pointer-events-none" />

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 xs:w-20 xs:h-20 sm:w-28 sm:h-28 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -left-10 w-20 h-20 xs:w-24 xs:h-24 sm:w-36 sm:h-36 bg-primary rotate-45" />
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16 xs:w-20 xs:h-20 sm:w-28 sm:h-28 overflow-hidden pointer-events-none">
              <div className="absolute -bottom-10 -right-10 w-20 h-20 xs:w-24 xs:h-24 sm:w-36 sm:h-36 bg-accent rotate-45" />
            </div>

            <div className="relative h-full flex flex-col items-center justify-between text-center px-5 py-6 xs:px-8 xs:py-8 sm:px-14 sm:py-10">
              {/* Header */}
              <div className="w-full">
                <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-md mb-2 xs:mb-3">
                  <Award className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-white" strokeWidth={1.75} />
                </div>

                <p className="text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-primary/70 mb-1">
                  LearnAfrica Lite
                </p>

                <h1 className="text-lg xs:text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-wide">
                  Certificate of Completion
                </h1>

                <div className="flex items-center gap-2 xs:gap-3 justify-center mt-2 xs:mt-3">
                  <div className="h-px w-8 xs:w-12 sm:w-16 bg-gradient-to-r from-transparent to-primary/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <div className="h-px w-8 xs:w-12 sm:w-16 bg-gradient-to-l from-transparent to-primary/50" />
                </div>
              </div>

              {/* Recipient */}
              <div className="w-full flex-1 flex flex-col items-center justify-center py-2 xs:py-3 min-h-0">
                <p className="text-[10px] xs:text-xs sm:text-sm text-slate-500 mb-1 xs:mb-2">
                  This certifies that
                </p>

                <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-serif italic font-semibold text-primary mb-2 xs:mb-3 px-2 max-w-full truncate">
                  {certificate.userName}
                </h2>

                <p className="text-[10px] xs:text-xs sm:text-sm text-slate-500 mb-1">
                  has successfully completed the course
                </p>

                <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold text-slate-800 px-2 max-w-full truncate">
                  {certificate.courseTitle}
                </h3>

                <div className={`grid ${courseDuration ? 'grid-cols-3' : 'grid-cols-2'} gap-2 xs:gap-3 max-w-xs xs:max-w-sm sm:max-w-md mx-auto mt-3 xs:mt-5 w-full`}>
                  <div className="px-1 py-1.5 xs:px-3 xs:py-2 bg-primary/5 rounded-lg border border-primary/10 min-w-0">
                    <p className="text-[7px] xs:text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 truncate">Grade</p>
                    <p className="text-[10px] xs:text-xs sm:text-sm font-bold text-primary mt-0.5 truncate">{certificate.grade}</p>
                  </div>

                  {courseDuration && (
                    <div className="px-1 py-1.5 xs:px-3 xs:py-2 bg-primary/5 rounded-lg border border-primary/10 min-w-0">
                      <p className="text-[7px] xs:text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 truncate">Duration</p>
                      <p className="text-[10px] xs:text-xs sm:text-sm font-bold text-primary mt-0.5 truncate">{courseDuration}</p>
                    </div>
                  )}

                  <div className="px-1 py-1.5 xs:px-3 xs:py-2 bg-primary/5 rounded-lg border border-primary/10 min-w-0">
                    <p className="text-[7px] xs:text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 truncate">Completed</p>
                    <p className="text-[10px] xs:text-xs sm:text-sm font-bold text-primary mt-0.5 truncate">{formattedDate}</p>
                  </div>
                </div>
              </div>

              {/* Signatures + footer */}
              <div className="w-full">
                <div className="flex flex-row items-end justify-center gap-4 xs:gap-10 sm:gap-16 pt-3 xs:pt-4 border-t border-slate-200">
                  <div className="text-center flex-1 xs:flex-initial min-w-0 max-w-[110px] xs:max-w-[150px]">
                    <div className="font-serif text-xs xs:text-sm sm:text-base italic text-slate-700 mb-0.5 truncate">
                      {certificate.instructorName}
                    </div>
                    <div className="h-px w-full bg-slate-300 mb-1" />
                    <p className="text-[7px] xs:text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-tight">Instructor</p>
                  </div>

                  <div className="shrink-0 flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full border-2 border-accent/40 bg-gradient-to-br from-accent/10 to-primary/10">
                    <div className="text-center">
                      <div className="text-[9px] xs:text-[10px] sm:text-xs font-black text-primary leading-none">LAF</div>
                      <div className="text-[5px] xs:text-[6px] uppercase font-bold tracking-wide text-slate-400 mt-0.5">Seal</div>
                    </div>
                  </div>

                  <div className="text-center flex-1 xs:flex-initial min-w-0 max-w-[110px] xs:max-w-[150px]">
                    <div className="font-serif text-xs xs:text-sm sm:text-base italic text-slate-700 mb-0.5 truncate">
                      LearnAfrica Team
                    </div>
                    <div className="h-px w-full bg-slate-300 mb-1" />
                    <p className="text-[7px] xs:text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-tight">Director</p>
                  </div>
                </div>

                <div className="mt-2 xs:mt-3 text-center">
                  <p className="text-[7px] xs:text-[9px] sm:text-[10px] text-slate-400 truncate">
                    Certificate ID: <span className="font-mono font-medium text-slate-600">{certificate.verificationCode}</span>
                  </p>
                  <p className="text-[6px] xs:text-[8px] sm:text-[9px] text-slate-400/80 hidden xs:block mt-0.5">
                    Verify at {window.location.host}/verify/{certificate.verificationCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Share Group */}
          <div className="mt-5 sm:mt-6 text-center">
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
